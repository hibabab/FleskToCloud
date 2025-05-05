import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContratAuto } from 'src/assurance-auto/entities/ContratAuto.entity';
import { User } from 'src/auth/entities/user.entity';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { LessThanOrEqual, Like, MoreThan, Not, Repository } from 'typeorm';
import { SmsService } from '../sms/sms.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  // Injection du repository NotificationEntity
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ContratAuto)
    private readonly contratAutoRepository: Repository<ContratAuto>,
    private readonly smsService: SmsService,
  ) {}
  private readonly logger = new Logger(NotificationService.name);
  // Méthode pour créer une notification
  async creerNotification(
    userId: number,
    message: string,
    status?: string,
  ): Promise<NotificationEntity> {
    try {
      // Créer une nouvelle notification
      const notification = new NotificationEntity();
      notification.message = message;
      
      // Associer l'utilisateur à la notification
      notification.user = { id: userId } as User;
      
      // Gestion correcte du statut optionnel
      if (status !== undefined) {
        notification.status = status;
      } else {
        notification.status = null; // ou une valeur par défaut si nécessaire
      }
      
      // Sauvegarder la notification dans la base de données
      return await this.notificationRepository.save(notification);
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw new Error('Erreur interne lors de la création de la notification');
    }
  }
  async getNotificationsByUserId(
    userId: number,
  ): Promise<NotificationEntity[]> {
    try {
      return await this.notificationRepository.find({
        where: { user: { id: userId } },
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw new Error(
        'Erreur interne lors de la récupération des notifications',
      );
    }
  }
  async envoyerNotificationTousAgentsDeService(
    message: string,
    status?: string
  ): Promise<NotificationEntity[]> {
    try {
      // Récupération des agents de service
      const agents = await this.userRepository.find({
        where: { role: 'agent service' },
      });
  
      if (!agents.length) {
        return [];
      }
  
      // Création des notifications avec gestion propre du statut
      const notificationsPromises = agents.map((agent) =>
        this.creerNotification(
          agent.id, 
          message,
          status // On passe simplement le paramètre status (peut être undefined)
        )
      );
  
      return await Promise.all(notificationsPromises);
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
      throw new Error(
        `Échec de l'envoi des notifications aux agents de service: ${error.message}`,
      );
    }
  }
  async envoyerNotificationTousAgentsDeServiceSaufUn(
    message: string,
    agentIdAExclure: number,
  ): Promise<NotificationEntity[]> {
    try {
      // Récupérer tous les agents de service sauf celui à exclure
      const agents = await this.userRepository.find({
        where: {
          role: 'agent service',
          id: Not(agentIdAExclure), // Exclure l'agent spécifique
        },
      });

      if (!agents.length) {
        return []; // Retourner un tableau vide si aucun agent trouvé
      }

      // Créer les notifications
      const notificationsPromises = agents.map((agent) =>
        this.creerNotification(agent.id, message),
      );

      return await Promise.all(notificationsPromises);
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi des notifications aux agents (sauf un):",
        error,
      );
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Échec de l'envoi des notifications aux agents (sauf un): ${error.message}`,
      );
    }
  }
  async createSubscriptionRequest(user: User, formData: any): Promise<NotificationEntity> {
    const notification = new NotificationEntity();
    notification.message = `Nouvelle demande de souscription de ${user.email}`;
    notification.user = user;
    notification.type = 'subscription_request';
    notification.metadata = formData;
    notification.status = 'pending';
    notification.visibleToUser = false; 

    const savedNotif = await this.notificationRepository.save(notification);

    // Envoyer copie à tous les agents
    await this.envoyerNotificationTousAgentsDeService(
      `Nouvelle demande de souscription à traiter (ID: ${savedNotif.id})`
    );

    return savedNotif;
  }
  async createSubscriptionRequestVie(user: User, formData: any): Promise<NotificationEntity> {
    const notification = new NotificationEntity();
    notification.message = `Nouvelle demande de souscription de ${user.email}`;
    notification.user = user;
    notification.type = 'vie_subscription_request';
    notification.metadata = formData;
    notification.status = 'pending';
    notification.visibleToUser = false; 

    const savedNotif = await this.notificationRepository.save(notification);
    await this.envoyerNotificationTousAgentsDeService(
      `Nouvelle demande de souscription à traiter (ID: ${savedNotif.id})`
    );

    return savedNotif;
  }
  async getPendingSubscriptionRequests(): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({
      where: { 
        type: 'subscription_request',
        status: 'pending'
      },
      relations: ['user']
    });
  }

  async processSubscriptionRequest(
    agent: User,
    notificationId: number,
    decision: 'accept' | 'reject'
  ): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOne({
      where: { 
        id: notificationId,
        type: 'subscription_request',
        status: 'pending'
      },
      relations: ['user']
    });

    if (!notification) {
      throw new Error('Demande non trouvée ou déjà traitée');
    }

    // Mettre à jour la notification principale
    notification.status = decision === 'accept' ? 'accepted' : 'rejected';
    notification.processedByAgent = agent;
    await this.notificationRepository.save(notification);

    // Notifier l'utilisateur
    const userMessage = decision === 'accept'
      ? 'Votre demande de souscription a été acceptée!'
      : 'Votre demande de souscription a été refusée.';
    
    await this.creerNotification(
      notification.user.id,
      userMessage
    );

    // Notifier les autres agents
    await this.envoyerNotificationTousAgentsDeServiceSaufUn(
      `Demande #${notificationId} traitée par ${agent.email}`,
      agent.id
    );

    return notification;
  }
  async processVieSubscriptionRequest(
    agent: User,
    notificationId: number,
    decision: 'accept' | 'reject'
  ): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOne({
      where: { 
        id: notificationId,
        type:'vie_subscription_request',
        status: 'pending'
      },
      relations: ['user']
    });

    if (!notification) {
      throw new Error('Demande non trouvée ou déjà traitée');
    }

    // Mettre à jour la notification principale
    notification.status = decision === 'accept' ? 'accepted' : 'rejected';
    notification.processedByAgent = agent;
    await this.notificationRepository.save(notification);

    // Notifier l'utilisateur
    const userMessage = decision === 'accept'
      ? 'Votre demande de souscription a été acceptée!'
      : 'Votre demande de souscription a été refusée.';
    
    await this.creerNotification(
      notification.user.id,
      userMessage
    );

    // Notifier les autres agents
    await this.envoyerNotificationTousAgentsDeServiceSaufUn(
      `Demande #${notificationId} traitée par ${agent.email}`,
      agent.id
    );

    return notification;
  }
  async getNotificationById(notificationId: number): Promise<NotificationEntity> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId },
        relations: ['user', 'processedByAgent']
      });
      
      if (!notification) {
        throw new Error('Notification non trouvée');
      }
      
      return notification;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la notification ${notificationId}:`, error);
      throw new Error(`Erreur lors de la récupération de la notification: ${error.message}`);
    }
  }
  async markMultipleAsRead(notificationIds: number[]): Promise<number> {
    try {
      const result = await this.notificationRepository
        .createQueryBuilder()
        .update(NotificationEntity)
        .set({ 
          isRead: true,
          
        })
        .whereInIds(notificationIds)
        .execute();

      return result.affected || 0;
    } catch (error) {
      console.error('Erreur lors du marquage multiple comme lu:', error);
      throw new Error(`Erreur lors du marquage multiple: ${error.message}`);
    }
  }

  
  async getUnreadNotifications(userId: number): Promise<NotificationEntity[]> {
    try {
      return await this.notificationRepository.find({
        where: { 
          user: { id: userId },
          isRead: false ,visibleToUser: true
        },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non lues:', error);
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }
  }
  async markAsRead(notificationId: number): Promise<NotificationEntity> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId }
      });
      
      if (!notification) {
        throw new Error('Notification non trouvée');
      }
      
      notification.isRead = true;
      return await this.notificationRepository.save(notification);
    } catch (error) {
      console.error(`Erreur lors du marquage de la notification ${notificationId} comme lue:`, error);
      throw new Error(`Erreur lors du marquage comme lu: ${error.message}`);
    }
  }
  async envoyerNotificationAvecLien(
    userId: number,
    message: string,
    type: string,
    link?: string,
    contractId?: number,
    metadata?: any
  ): Promise<NotificationEntity> {
    try {
      const notification = new NotificationEntity();
      notification.message = message;
      notification.user = { id: userId } as User;
      notification.type = type as any;
      
      if (link) {
        notification.link = link;
      }
      
      if (contractId) {
        notification.contractId = contractId;
      }
      
      if (metadata) {
        notification.metadata = metadata;
      }
      
      return await this.notificationRepository.save(notification);
    } catch (error) {
      console.error('Erreur lors de la création de la notification avec lien:', error);
      throw new Error('Erreur interne lors de la création de la notification avec lien');
    }
  }
  async processPaymentNotification(
    agent: User,
    notificationId: number
  ): Promise<NotificationEntity> {
    // Récupérer la notification
    const notification = await this.getNotificationById(notificationId);
    if (!notification) {
      throw new Error(`Notification avec l'ID ${notificationId} non trouvée`);
    }
  
    // Vérifier si la notification est déjà traitée
    if (notification.status !== 'pending') {
      throw new Error('Cette notification de paiement a déjà été traitée');
    }
  
    // Mettre à jour le statut et l'agent qui a traité
    notification. status='processing';
    notification.processedByAgent = agent;
    notification.createdAt = new Date();
  
    // Sauvegarder les modifications
    return await this.notificationRepository.save(notification);
  }
   EVERY_DAY_AT_MIDNIGHT  = '40 9 * * *';

  
  @Cron('43 15 * * *')
  async verifierContratsExpiration(envoyerNotifications: boolean = true): Promise<number> {
    this.logger.log('Vérification des contrats qui expirent bientôt...');
    
    // Date actuelle
    const aujourdhui = new Date();
    
    // Date dans 14 jours
    const dansDeuxSemaines = new Date();
    dansDeuxSemaines.setDate(dansDeuxSemaines.getDate() + 14);
    
    // Trouver les contrats qui expirent exactement dans 14 jours
    // Pour éviter d'envoyer plusieurs notifications pour le même contrat
    const dateDebut = new Date(aujourdhui);
    dateDebut.setHours(0, 0, 0, 0);
    
    const dateFin = new Date(aujourdhui);
    dateFin.setHours(23, 59, 59, 999);
    dateFin.setDate(dateFin.getDate() + 14);
    
    const contratsExpirants = await this.contratAutoRepository.find({
      where: {
        dateExpiration: MoreThan(dateDebut) && LessThanOrEqual(dateFin),
        etat: 'valide',
      },
      relations: ['assure', 'assure.user'],
    });
    
    this.logger.log(`Nombre de contrats expirant dans deux semaines: ${contratsExpirants.length}`);

    // Vérifier si nous devons envoyer des notifications
    if (envoyerNotifications) {
      // Créer et envoyer des notifications pour chaque contrat
      for (const contrat of contratsExpirants) {
        await this.creerNotificationExpiration(contrat);
      }
      this.logger.log(`Notifications envoyées pour ${contratsExpirants.length} contrats`);
    } else {
      this.logger.log(`Pas d'envoi de notifications (mode vérification uniquement)`);
    }
    
    return contratsExpirants.length;
  }

  // Le reste du code reste inchangé
  
  // Créer et envoyer une notification pour l'expiration d'un contrat
  async creerNotificationExpiration(contrat: ContratAuto) {
    try {
      const user = contrat.assure.user;
      const dateExpirationFormatee = new Date(contrat.dateExpiration).toLocaleDateString('fr-FR');
      
      // Vérifier si une notification a déjà été envoyée aujourd'hui pour ce contrat
      const aujourdhui = new Date();
      aujourdhui.setHours(0, 0, 0, 0);
      
      const notificationExistante = await this.notificationRepository.findOne({
        where: {
          type: 'EXPIRATION_CONTRAT',
          user: { id: user.id },
          createdAt: MoreThan(aujourdhui),
          message: Like(`%contrat d'assurance automobile n°${contrat.num}%`),
        },
      });
      
      if (notificationExistante) {
        this.logger.log(`Une notification a déjà été envoyée aujourd'hui pour le contrat ${contrat.num}`);
        return;
      }
      
      // Créer la notification
      const notification = this.notificationRepository.create({
        message: `Votre contrat d'assurance automobile n°${contrat.num} expire le ${dateExpirationFormatee}. Veuillez procéder au renouvellement.`,
        type: 'EXPIRATION_CONTRAT',
        user: user,
      });
      
      // Enregistrer la notification dans la base de données
      await this.notificationRepository.save(notification);
      
      // Envoyer le SMS
      await this.envoyerSmsNotification(user, notification);
      
      this.logger.log(`Notification créée pour le contrat ${contrat.num}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la création de la notification pour le contrat ${contrat.num}`, error.stack);
    }
  }

  // Envoyer un SMS via TunisieSMS
  async envoyerSmsNotification(user: User, notification: NotificationEntity) {
    try {
      const messageEnvoye = await this.smsService.envoyerSms(
        user.telephone,
        notification.message
      );

      if (messageEnvoye) {
        
        await this.notificationRepository.save(notification);
        this.logger.log(`SMS envoyé avec succès à ${user.telephone}`);
      }
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi du SMS: ${error.message}`, error.stack);
    }
  }

 
}
