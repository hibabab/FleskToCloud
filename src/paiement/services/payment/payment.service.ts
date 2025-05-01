import { HttpService } from '@nestjs/axios';
import { Injectable, HttpException, Logger, NotFoundException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Connection, Repository } from 'typeorm';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { ContratAuto } from 'src/assurance-auto/entities/ContratAuto.entity';
import { Payment } from 'src/paiement/entities/payment.entity';
import { ContratVie } from 'src/assurance-vie/entities/contrat-vie.entity';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService,
      @InjectRepository(ContratVie)
      private contratVieRepository: Repository<ContratVie>,
      @InjectRepository(ContratAuto)
      private readonly contratRepository: Repository<ContratAuto>,
      @InjectRepository(Payment)
      private readonly paymentRepository: Repository<Payment>,
      @InjectConnection() // Injectez la connexion TypeORM
      private readonly connection: Connection,
    
    ) { }

    async generatePaymentLink(
        contratNum: number,
        successUrl: string,
        failUrl: string,
      ) {
        try {
          // 1. Récupération du contrat avec vérification
          this.logger.log(`Tentative de récupération du contrat ${contratNum}`);
          const contrat = await this.contratRepository.findOne({
            where: { num: contratNum },
            relations: ['payment', 'assure', 'assure.user'],
          });
      
          if (!contrat) {
            this.logger.error(`Contrat ${contratNum} non trouvé`);
            throw new HttpException('Contrat non trouvé', 404);
          }
          this.logger.log(`Contrat ${contratNum} trouvé`);
      
          // 2. Vérification si un paiement existe déjà
          if (contrat.payment) {
            this.logger.warn(`Un paiement existe déjà pour le contrat ${contratNum}`);
            throw new HttpException('Un paiement existe déjà pour ce contrat', 400);
          }
      
          // 3. Validation du montant de l'échéance
          this.logger.log(`Vérification du montant d'échéance: ${contrat.cotisationTotale}`);
          if (!contrat.cotisationTotale || contrat.cotisationTotale <= 0) {
            this.logger.error(`Montant d'échéance invalide pour le contrat ${contratNum}: ${contrat.cotisationTotale}`);
            throw new HttpException("Le montant de l'échéance est invalide", 400);
          }
      
          // 4. Création de l'entité Payment
          const payment = this.paymentRepository.create({
            trackingId: `PAY-${contrat.num}-${Date.now()}`,
            amount: contrat.cotisationTotale,
            status: 'PENDING',
            contrat: contrat,
          });
          this.logger.log(`Entité Payment créée: ${payment.trackingId}`);
      
          const queryRunner = this.connection.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();
          try {
            // 5. Appel à l'API Flouci
            this.logger.log(`Préparation de l'appel API Flouci avec montant: ${Math.round(contrat.cotisationTotale * 1000)}`);
            
            // Log des paramètres de l'appel API
            const requestParams = {
              app_token: this.configService.get('FLOUCI_APP_TOKEN') ? '[CONFIGURÉ]' : '[MANQUANT]',
              app_secret: this.configService.get('FLOUCI_APP_SECRET') ? '[CONFIGURÉ]' : '[MANQUANT]',
              amount: Math.round(contrat.cotisationTotale * 1000).toString(),
              accept_card: 'true',
              session_timeout_secs: 1200,
              success_link: successUrl,
              fail_link: failUrl,
              developer_tracking_id: payment.trackingId,
              customer_name: `${contrat.assure.user?.nom || ''} ${contrat.assure.user?.prenom || ''}`.trim(),
              customer_email: contrat.assure.user?.email || '',
            };
            this.logger.log(`Paramètres de l'appel API Flouci: ${JSON.stringify(requestParams, (key, value) => 
              key === 'app_secret' ? '[MASQUÉ]' : value
            )}`);
      
            const response = await firstValueFrom(
              this.httpService.post(
                'https://developers.flouci.com/api/generate_payment',
                {
                  app_token: this.configService.get('FLOUCI_APP_TOKEN'),
                  app_secret: this.configService.get('FLOUCI_APP_SECRET'),
                  amount: Math.round(contrat.cotisationTotale * 1000).toString(), // Conversion en millimes
                  accept_card: 'true',
                  session_timeout_secs: 1200, // 20 minutes
                  success_link: successUrl,
                  fail_link: failUrl,
                  developer_tracking_id: payment.trackingId,
                  customer_name: `${contrat.assure.user?.nom || ''} ${contrat.assure.user?.prenom || ''}`.trim(),
                  customer_email: contrat.assure.user?.email || '',
                },
                { headers: { 'Content-Type': 'application/json' } }
              )
            );
      
            this.logger.log(`Réponse de l'API Flouci reçue: ${response.status}`);
            
            // Vérifiez que la réponse contient les données attendues
            if (!response.data?.result?.payment_id || !response.data?.result?.link) {
              this.logger.error(`Réponse API invalide: ${JSON.stringify(response.data)}`);
              throw new HttpException("Réponse invalide de l'API de paiement", 500);
            }
      
            // 6. Sauvegarde du paiement avec l'ID Flouci
            payment.paymentId = response.data.result.payment_id;
            this.logger.log(`Sauvegarde du paiement avec ID: ${payment.paymentId}`);
            
            // Utilisez uniquement queryRunner pour la sauvegarde, pas le repository directement
            await queryRunner.manager.save(payment);
            
            this.logger.log(`Paiement sauvegardé, commit de la transaction`);
            await queryRunner.commitTransaction();
            
            return {
              success: true,
              paymentLink: response.data.result.link,
              paymentId: payment.paymentId,
              trackingId: payment.trackingId,
              amount: payment.amount,
              expiration: new Date(Date.now() + 1200 * 1000).toISOString(), // 20 minutes
            };
            
          } catch (error) {
            await queryRunner.rollbackTransaction();
            
            this.logger.error(`Erreur génération paiement: ${error.message}`);
            this.logger.error(`Stack trace: ${error.stack}`);
            
            // Log plus détaillé pour les erreurs de l'API externe
            if (error.response) {
              this.logger.error(`Réponse d'erreur API: ${JSON.stringify({
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
              })}`);
            }
            
            throw new HttpException(
              error.response?.data?.message || "Erreur lors de la génération du lien de paiement",
              error.response?.status || 500
            );
           
          } finally {
            // Release dans tous les cas
            await queryRunner.release();
          }
        } catch (error) {
          this.logger.error(`Erreur globale: ${error.message}`);
          this.logger.error(`Stack trace: ${error.stack}`);
          throw error; // Re-lancer l'erreur pour gestion plus haut dans la pile
        }
      }
      async verifyPayment(paymentId: string) {
        if (!paymentId) {
          throw new HttpException('ID de paiement manquant', 400);
        }
      
        // 1. Récupération du paiement avec le contrat associé
        const payment = await this.paymentRepository.findOne({
          where: { paymentId },
          relations: ['contrat'],
        });
      
        if (!payment) {
          this.logger.error(`Paiement ${paymentId} non trouvé`);
          throw new HttpException('Paiement non trouvé', 404);
        }
      
        try {
          // 2. Vérification auprès de Flouci
          const { data } = await firstValueFrom(
            this.httpService.get(
              `https://developers.flouci.com/api/verify_payment/${paymentId}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'apppublic': this.configService.get('FLOUCI_APP_TOKEN'),
                  'appsecret': this.configService.get('FLOUCI_APP_SECRET'),
                },
              }
            )
          );
      
          const newStatus = data.result?.status === 'SUCCESS' ? 'PAID' : 'FAILED';
          
          // Stocker le numéro du contrat avant la suppression potentielle
          const contratNum = payment.contrat.num;
          const amount = payment.amount;
          
          // 3. Traitement selon le statut
          if (newStatus === 'FAILED') {
            // Suppression directe si le paiement a échoué
            this.logger.log(`Paiement ${paymentId} échoué: suppression`);
            await this.paymentRepository.remove(payment);
            
            return {
              success: true,
              status: 'FAILED',
              contratNum: contratNum,
              amount: amount,
              deleted: true,
            };
          } else {
            // Mise à jour normale pour les paiements réussis
            payment.status = 'PAID';
            payment.paymentDate = new Date();
            await this.paymentRepository.save(payment);
            
            this.logger.log(`Paiement ${paymentId} vérifié: PAID`);
            
            return {
              success: true,
              status: 'PAID',
              contratNum: contratNum,
              amount: amount,
              paymentDate: payment.paymentDate,
            };
          }
        } catch (error) {
          this.logger.error(`Erreur vérification paiement ${paymentId}: ${error.message}`);
          throw new HttpException(
            error.response?.data?.message || "Erreur lors de la vérification du paiement",
            error.response?.status || 500
          );
        }
      }

async getPaymentByContrat(contratNum: number) {
    const contrat = await this.contratRepository.findOne({
      where: { num: contratNum },
      relations: ['payment'],
    });
  
    if (!contrat) {
      throw new HttpException('Contrat non trouvé', 404);
    }
  
    if (!contrat.payment) {
      return {
        hasPayment: false,
        status: 'NO_PAYMENT',
      };
    }
  
    return {
      hasPayment: true,
      paymentId: contrat.payment.paymentId,
      trackingId: contrat.payment.trackingId,
      status: contrat.payment.status,
      amount: contrat.payment.amount,
      paymentDate: contrat.payment.paymentDate,
    };
  }
  async cancelPayment(contratNum: number) {
    this.logger.log(`Tentative d'annulation du paiement pour le contrat ${contratNum}`);
    
    // 1. Récupération du contrat avec son paiement associé
    const contrat = await this.contratRepository.findOne({
      where: { num: contratNum },
      relations: ['payment'],
    });
  
    if (!contrat) {
      this.logger.error(`Contrat ${contratNum} non trouvé`);
      throw new HttpException('Contrat non trouvé', 404);
    }
  
    // 2. Vérification de l'existence d'un paiement
    if (!contrat.payment) {
      this.logger.warn(`Aucun paiement trouvé pour le contrat ${contratNum}`);
      throw new HttpException('Aucun paiement trouvé pour ce contrat', 404);
    }
  
    // 3. Vérification du statut du paiement
    if (contrat.payment.status === 'PAID') {
      this.logger.error(`Impossible d'annuler un paiement déjà effectué pour le contrat ${contratNum}`);
      throw new HttpException('Impossible d\'annuler un paiement déjà effectué', 400);
    }
  
    // 4. Suppression du paiement
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Récupérer les informations du paiement avant suppression
      const paymentInfo = {
        paymentId: contrat.payment.paymentId,
        trackingId: contrat.payment.trackingId,
        amount: contrat.payment.amount,
        status: contrat.payment.status
      };
      
      // Supprimer le paiement
      await queryRunner.manager.remove(contrat.payment);
      await queryRunner.commitTransaction();
      
      this.logger.log(`Paiement pour le contrat ${contratNum} annulé avec succès`);
      
      return {
        success: true,
        message: "Paiement annulé avec succès",
        data: paymentInfo
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      this.logger.error(`Erreur lors de l'annulation du paiement: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      
      throw new HttpException(
        "Erreur lors de l'annulation du paiement",
        500
      );
    } finally {
      await queryRunner.release();
    }
  }
  async cancel(contratNum: number) {
    this.logger.log(`Tentative d'annulation du paiement pour le contrat ${contratNum}`);
    
    // 1. Récupération du contrat avec son paiement associé
    const contrat = await this.contratRepository.findOne({
      where: { num: contratNum },
      relations: ['payment'],
    });
  
    if (!contrat) {
      this.logger.error(`Contrat ${contratNum} non trouvé`);
      throw new HttpException('Contrat non trouvé', 404);
    }
  
    // 2. Vérification de l'existence d'un paiement
    if (!contrat.payment) {
      this.logger.warn(`Aucun paiement trouvé pour le contrat ${contratNum}`);
      throw new HttpException('Aucun paiement trouvé pour ce contrat', 404);
    }
   // 4. Suppression du paiement
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Récupérer les informations du paiement avant suppression
      const paymentInfo = {
        paymentId: contrat.payment.paymentId,
        trackingId: contrat.payment.trackingId,
        amount: contrat.payment.amount,
        status: contrat.payment.status
      };
      
      // Supprimer le paiement
      await queryRunner.manager.remove(contrat.payment);
      await queryRunner.commitTransaction();
      
      this.logger.log(`Paiement pour le contrat ${contratNum} annulé avec succès`);
      
      return {
        success: true,
        message: "Paiement annulé avec succès",
        data: paymentInfo
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      this.logger.error(`Erreur lors de l'annulation du paiement: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      
      throw new HttpException(
        "Erreur lors de l'annulation du paiement",
        500
      );
    } finally {
      await queryRunner.release();
    }
  }
  async createLocalPayment(contratNum: number) {
    this.logger.log(`Création d'un paiement local pour le contrat ${contratNum}`);
    
    try {
      // 1. Récupération du contrat avec vérification
      const contrat = await this.contratRepository.findOne({
        where: { num: contratNum },
        relations: ['payment', 'assure', 'assure.user'],
      });
  
      if (!contrat) {
        this.logger.error(`Contrat ${contratNum} non trouvé`);
        throw new HttpException('Contrat non trouvé', 404);
      }
      this.logger.log(`Contrat ${contratNum} trouvé`);
  
      // 2. Vérification si un paiement existe déjà
      if (contrat.payment) {
        this.logger.warn(`Un paiement existe déjà pour le contrat ${contratNum}`);
        throw new HttpException('Un paiement existe déjà pour ce contrat', 400);
      }
  
      // 3. Validation du montant de l'échéance
      this.logger.log(`Vérification du montant d'échéance: ${contrat.cotisationTotale}`);
      if (!contrat.cotisationTotale || contrat.cotisationTotale <= 0) {
        this.logger.error(`Montant d'échéance invalide pour le contrat ${contratNum}: ${contrat.cotisationTotale}`);
        throw new HttpException("Le montant de l'échéance est invalide", 400);
      }
  
      // 4. Création de l'entité Payment pour un paiement local en espèces
      const payment = this.paymentRepository.create({
        trackingId: `LOCAL-${contratNum}-${Date.now()}`,
        paymentId: `CASH-${contratNum}-${Date.now()}`,
        amount: contrat.cotisationTotale,
        status: 'PAID',
        paymentDate: new Date(),
        contratNum: contrat.num, // Assignation explicite de la FK
        contrat: contrat // Assignation de la relation
      });
      
      this.logger.log(`Entité Payment local créée: ${payment.trackingId}`);
  
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        // 5. Sauvegarde du paiement local
        await queryRunner.manager.save(payment);
        
        this.logger.log(`Paiement local sauvegardé, commit de la transaction`);
        await queryRunner.commitTransaction();
        
        return {
          success: true,
          status: 'PAID',
          trackingId: payment.trackingId,
          paymentId: payment.paymentId,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          contratNum: contrat.num,
          paymentType: 'LOCAL_CASH'
        };
        
      } catch (error) {
        await queryRunner.rollbackTransaction();
        
        this.logger.error(`Erreur création paiement local: ${error.message}`);
        this.logger.error(`Stack trace: ${error.stack}`);
        
        throw new HttpException(
          "Erreur lors de la création du paiement local",
          500
        );
       
      } finally {
        // Release dans tous les cas
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(`Erreur globale: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw error; // Re-lancer l'erreur pour gestion plus haut dans la pile
    }
  }


  // For the ContratVie service

async generatePaymentLinkVie(
  contratNum: number,
  successUrl: string,
  failUrl: string,
) {
  try {
    // 1. Récupération du contrat avec vérification
    this.logger.log(`Tentative de récupération du contrat vie ${contratNum}`);
    const contrat = await this.contratVieRepository.findOne({
      where: { numero: contratNum },
      relations: ['payment', 'assureVie', 'assureVie.user'],
    });

    if (!contrat) {
      this.logger.error(`Contrat vie ${contratNum} non trouvé`);
      throw new HttpException('Contrat non trouvé', 404);
    }
    this.logger.log(`Contrat vie ${contratNum} trouvé`);

    // 2. Vérification si un paiement existe déjà
    if (contrat.payment) {
      this.logger.warn(`Un paiement existe déjà pour le contrat vie ${contratNum}`);
      throw new HttpException('Un paiement existe déjà pour ce contrat', 400);
    }

    // 3. Validation du montant de la cotisation
    this.logger.log(`Vérification du montant de cotisation: ${contrat.cotisation}`);
    if (!contrat.cotisation || contrat.cotisation <= 0) {
      this.logger.error(`Montant de cotisation invalide pour le contrat vie ${contratNum}: ${contrat.cotisation}`);
      throw new HttpException("Le montant de la cotisation est invalide", 400);
    }

    // 4. Création de l'entité Payment
    const payment = this.paymentRepository.create({
      trackingId: `PAY-VIE-${contrat.numero}-${Date.now()}`,
      amount: contrat.cotisation,
      status: 'PENDING',
      contratVie: contrat,
    });
    this.logger.log(`Entité Payment créée: ${payment.trackingId}`);

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 5. Appel à l'API Flouci
      this.logger.log(`Préparation de l'appel API Flouci avec montant: ${Math.round(contrat.cotisation * 1000)}`);
      
      // Log des paramètres de l'appel API
      const requestParams = {
        app_token: this.configService.get('FLOUCI_APP_TOKEN') ? '[CONFIGURÉ]' : '[MANQUANT]',
        app_secret: this.configService.get('FLOUCI_APP_SECRET') ? '[CONFIGURÉ]' : '[MANQUANT]',
        amount: Math.round(contrat.cotisation * 1000).toString(),
        accept_card: 'true',
        session_timeout_secs: 1200,
        success_link: successUrl,
        fail_link: failUrl,
        developer_tracking_id: payment.trackingId,
        customer_name: `${contrat.assureVie.user?.nom || ''} ${contrat.assureVie.user?.prenom || ''}`.trim(),
        customer_email: contrat.assureVie.user?.email || '',
      };
      this.logger.log(`Paramètres de l'appel API Flouci: ${JSON.stringify(requestParams, (key, value) => 
        key === 'app_secret' ? '[MASQUÉ]' : value
      )}`);

      const response = await firstValueFrom(
        this.httpService.post(
          'https://developers.flouci.com/api/generate_payment',
          {
            app_token: this.configService.get('FLOUCI_APP_TOKEN'),
            app_secret: this.configService.get('FLOUCI_APP_SECRET'),
            amount: Math.round(contrat.cotisation * 1000).toString(), // Conversion en millimes
            accept_card: 'true',
            session_timeout_secs: 1200, // 20 minutes
            success_link: successUrl,
            fail_link: failUrl,
            developer_tracking_id: payment.trackingId,
            customer_name: `${contrat.assureVie.user?.nom || ''} ${contrat.assureVie.user?.prenom || ''}`.trim(),
            customer_email: contrat.assureVie.user?.email || '',
          },
          { headers: { 'Content-Type': 'application/json' } }
        )
      );

      this.logger.log(`Réponse de l'API Flouci reçue: ${response.status}`);
      
      // Vérifiez que la réponse contient les données attendues
      if (!response.data?.result?.payment_id || !response.data?.result?.link) {
        this.logger.error(`Réponse API invalide: ${JSON.stringify(response.data)}`);
        throw new HttpException("Réponse invalide de l'API de paiement", 500);
      }

      // 6. Sauvegarde du paiement avec l'ID Flouci
      payment.paymentId = response.data.result.payment_id;
      this.logger.log(`Sauvegarde du paiement avec ID: ${payment.paymentId}`);
      
      // Utilisez uniquement queryRunner pour la sauvegarde, pas le repository directement
      await queryRunner.manager.save(payment);
      
      this.logger.log(`Paiement sauvegardé, commit de la transaction`);
      await queryRunner.commitTransaction();
      
      return {
        success: true,
        paymentLink: response.data.result.link,
        paymentId: payment.paymentId,
        trackingId: payment.trackingId,
        amount: payment.amount,
        expiration: new Date(Date.now() + 1200 * 1000).toISOString(), // 20 minutes
      };
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      this.logger.error(`Erreur génération paiement: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      
      // Log plus détaillé pour les erreurs de l'API externe
      if (error.response) {
        this.logger.error(`Réponse d'erreur API: ${JSON.stringify({
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        })}`);
      }
      
      throw new HttpException(
        error.response?.data?.message || "Erreur lors de la génération du lien de paiement",
        error.response?.status || 500
      );
     
    } finally {
      // Release dans tous les cas
      await queryRunner.release();
    }
  } catch (error) {
    this.logger.error(`Erreur globale: ${error.message}`);
    this.logger.error(`Stack trace: ${error.stack}`);
    throw error; // Re-lancer l'erreur pour gestion plus haut dans la pile
  }
}

async verifyPaymentVie(paymentId: string) {
  if (!paymentId) {
    throw new HttpException('ID de paiement manquant', 400);
  }

  // 1. Récupération du paiement avec le contrat associé
  const payment = await this.paymentRepository.findOne({
    where: { paymentId },
    relations: ['contratVie'],
  });

  if (!payment) {
    this.logger.error(`Paiement ${paymentId} non trouvé`);
    throw new HttpException('Paiement non trouvé', 404);
  }

  try {
    // 2. Vérification auprès de Flouci
    const { data } = await firstValueFrom(
      this.httpService.get(
        `https://developers.flouci.com/api/verify_payment/${paymentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'apppublic': this.configService.get('FLOUCI_APP_TOKEN'),
            'appsecret': this.configService.get('FLOUCI_APP_SECRET'),
          },
        }
      )
    );

    const newStatus = data.result?.status === 'SUCCESS' ? 'PAID' : 'FAILED';
    
    const contratNum = payment.contratVie?.numero;
    const amount = payment.amount;
    
    // 3. Traitement selon le statut
    if (newStatus === 'FAILED') {
      // Suppression directe si le paiement a échoué
      this.logger.log(`Paiement ${paymentId} échoué: suppression`);
      await this.paymentRepository.remove(payment);
      
      return {
        success: true,
        status: 'FAILED',
        contratNum: contratNum,
        amount: amount,
        deleted: true,
      };
    } else {
      // Mise à jour normale pour les paiements réussis
      payment.status = 'PAID';
      payment.paymentDate = new Date();
      await this.paymentRepository.save(payment);
      
      this.logger.log(`Paiement ${paymentId} vérifié: PAID`);
      
      return {
        success: true,
        status: 'PAID',
        contratNum: contratNum,
        amount: amount,
        paymentDate: payment.paymentDate,
      };
    }
  } catch (error) {
    this.logger.error(`Erreur vérification paiement ${paymentId}: ${error.message}`);
    throw new HttpException(
      error.response?.data?.message || "Erreur lors de la vérification du paiement",
      error.response?.status || 500
    );
  }
}

async getPaymentByContratVie(contratNum: number) {
  const contrat = await this.contratVieRepository.findOne({
    where: { numero: contratNum },
    relations: ['payment'],
  });

  if (!contrat) {
    throw new HttpException('Contrat vie non trouvé', 404);
  }

  if (!contrat.payment) {
    return {
      hasPayment: false,
      status: 'NO_PAYMENT',
    };
  }

  return {
    hasPayment: true,
    paymentId: contrat.payment.paymentId,
    trackingId: contrat.payment.trackingId,
    status: contrat.payment.status,
    amount: contrat.payment.amount,
    paymentDate: contrat.payment.paymentDate,
  };
}

async cancelPaymentVie(contratNum: number) {
  this.logger.log(`Tentative d'annulation du paiement pour le contrat vie ${contratNum}`);
  
  // 1. Récupération du contrat avec son paiement associé
  const contrat = await this.contratVieRepository.findOne({
    where: { numero: contratNum },
    relations: ['payment'],
  });

  if (!contrat) {
    this.logger.error(`Contrat vie ${contratNum} non trouvé`);
    throw new HttpException('Contrat non trouvé', 404);
  }

  // 2. Vérification de l'existence d'un paiement
  if (!contrat.payment) {
    this.logger.warn(`Aucun paiement trouvé pour le contrat vie ${contratNum}`);
    throw new HttpException('Aucun paiement trouvé pour ce contrat', 404);
  }

  // 3. Vérification du statut du paiement
  if (contrat.payment.status === 'PAID') {
    this.logger.error(`Impossible d'annuler un paiement déjà effectué pour le contrat vie ${contratNum}`);
    throw new HttpException('Impossible d\'annuler un paiement déjà effectué', 400);
  }

  // 4. Suppression du paiement
  const queryRunner = this.connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    // Récupérer les informations du paiement avant suppression
    const paymentInfo = {
      paymentId: contrat.payment.paymentId,
      trackingId: contrat.payment.trackingId,
      amount: contrat.payment.amount,
      status: contrat.payment.status
    };
    
    // Supprimer le paiement
    await queryRunner.manager.remove(contrat.payment);
    await queryRunner.commitTransaction();
    
    this.logger.log(`Paiement pour le contrat vie ${contratNum} annulé avec succès`);
    
    return {
      success: true,
      message: "Paiement annulé avec succès",
      data: paymentInfo
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    
    this.logger.error(`Erreur lors de l'annulation du paiement: ${error.message}`);
    this.logger.error(`Stack trace: ${error.stack}`);
    
    throw new HttpException(
      "Erreur lors de l'annulation du paiement",
      500
    );
  } finally {
    await queryRunner.release();
  }
}

async createLocalPaymentVie(contratNum: number) {
  this.logger.log(`Création d'un paiement local pour le contrat vie ${contratNum}`);
  
  try {
    // 1. Récupération du contrat avec vérification
    const contrat = await this.contratVieRepository.findOne({
      where: { numero: contratNum },
      relations: ['payment', 'assureVie', 'assureVie.user'],
    });

    if (!contrat) {
      this.logger.error(`Contrat vie ${contratNum} non trouvé`);
      throw new HttpException('Contrat non trouvé', 404);
    }
    this.logger.log(`Contrat vie ${contratNum} trouvé`);

    // 2. Vérification si un paiement existe déjà
    if (contrat.payment) {
      this.logger.warn(`Un paiement existe déjà pour le contrat vie ${contratNum}`);
      throw new HttpException('Un paiement existe déjà pour ce contrat', 400);
    }

    // 3. Validation du montant de la cotisation
    this.logger.log(`Vérification du montant de cotisation: ${contrat.cotisation}`);
    if (!contrat.cotisation || contrat.cotisation <= 0) {
      this.logger.error(`Montant de cotisation invalide pour le contrat vie ${contratNum}: ${contrat.cotisation}`);
      throw new HttpException("Le montant de la cotisation est invalide", 400);
    }

    // 4. Création de l'entité Payment pour un paiement local en espèces
    const payment = this.paymentRepository.create({
      trackingId: `LOCAL-VIE-${contratNum}-${Date.now()}`,
      paymentId: `CASH-VIE-${contratNum}-${Date.now()}`,
      amount: contrat.cotisation,
      status: 'PAID',
      paymentDate: new Date(),
      contratVie: contrat // Assignation de la relation
    });
    
    this.logger.log(`Entité Payment local créée: ${payment.trackingId}`);

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // 5. Sauvegarde du paiement local
      await queryRunner.manager.save(payment);
      
      this.logger.log(`Paiement local sauvegardé, commit de la transaction`);
      await queryRunner.commitTransaction();
      
      return {
        success: true,
        status: 'PAID',
        trackingId: payment.trackingId,
        paymentId: payment.paymentId,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        contratNum: contrat.numero,
        paymentType: 'LOCAL_CASH'
      };
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      this.logger.error(`Erreur création paiement local: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      
      throw new HttpException(
        "Erreur lors de la création du paiement local",
        500
      );
     
    } finally {
      // Release dans tous les cas
      await queryRunner.release();
    }
  } catch (error) {
    this.logger.error(`Erreur globale: ${error.message}`);
    this.logger.error(`Stack trace: ${error.stack}`);
    throw error; // Re-lancer l'erreur pour gestion plus haut dans la pile
  }
}
}