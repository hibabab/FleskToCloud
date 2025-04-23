import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { constat } from '../entities/constat.entity';
import { User } from 'src/auth/entities/user.entity';
import { Expert } from 'src/gestion-utilisateur/entities/Expert.entity';
import { NotificationService } from 'src/notification/services/notification/notification.service';
import { AgentServiceService } from 'src/gestion-utilisateur/services/agent-service/agent-service.service';
import { ExpertService } from 'src/gestion-utilisateur/services/expert/expert.service';
import { MailService } from 'src/service/mail.service';


@Injectable()
export class ConstaatService {
  // constructor(
  //   @InjectRepository(constat)
  //   private readonly constatRepository: Repository<constat>,
  //   @InjectRepository(User) // ✅ Ajout essentiel ici
  //   private readonly userRepository: Repository<User>,
  //   @InjectRepository(Expert) // ✅ Ajout essentiel ici
  //   private readonly expertRepository: Repository<Expert>,
  //   private readonly adresseService: AdresseService,
  //   private readonly temoinService: TemoinService,
  //   private readonly mailService: MailService,
  //   private readonly conducteurService: ConducteurService,
  //   private readonly expertService: ExpertService,
  //   private readonly AgentServiceService: AgentServiceService,
  //   private readonly notificationService: NotificationService,
  // ) {}

  // async getUserConstats(userId: number): Promise<constat[]> {
  //   return this.constatRepository.find({
  //     where: { user: { id: userId } },
  //     relations: ['lieu', 'conducteur', 'temoins'],
  //     order: { dateAccident: 'DESC' },
  //   });
  // }
  // async createConstat(
  //   constatDto: ConstatDto,
  //   userId: number,
  //   conducteur1Email: string,
  //   conducteur2Email: string,
  // ): Promise<constat> {
  //   // Recherche de l'utilisateur par ID
  //   const user = await this.userRepository.findOneBy({ id: userId });
  //   if (!user) {
  //     throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
  //   }

  //   // Création ou récupération de l'adresse
  //   const lieu = await this.adresseService.findOrCreate(constatDto.lieu);

  //   // Création du conducteur si nécessaire
  //   const conducteur = constatDto.conducteur
  //     ? await this.conducteurService.create(constatDto.conducteur)
  //     : undefined;

  //   // Création du constat
  //   const newConstat = this.constatRepository.create({
  //     ...constatDto,
  //     lieu,
  //     temoins: constatDto.temoins
  //       ? await Promise.all(
  //           constatDto.temoins.map((temoinDto) =>
  //             this.temoinService.create(temoinDto),
  //           ),
  //         )
  //       : [],
  //     conducteur,
  //     user,
  //   });

  //   // Sauvegarde du constat
  //   const savedConstat = await this.constatRepository.save(newConstat);

  //   // Vérification de la dateAccident et formatage
  //   let dateAccidentFormatted = '';
  //   if (savedConstat.dateAccident instanceof Date) {
  //     dateAccidentFormatted = savedConstat.dateAccident
  //       .toISOString()
  //       .split('T')[0]; // Format 'YYYY-MM-DD'
  //   } else {
  //     // Si la dateAccident n'est pas un objet Date, on tente de la parser (cas d'une chaîne)
  //     dateAccidentFormatted = new Date(savedConstat.dateAccident)
  //       .toISOString()
  //       .split('T')[0];
  //   }

  //   // Récupération de l'heure
  //   const heureFormatted = savedConstat.heure;

  //   // Vérification que les conducteurs ont un email et envoi
  //   if (conducteur1Email && conducteur2Email) {
  //     const constatDetails = {
  //       date: dateAccidentFormatted,
  //       heure: heureFormatted,
  //       lieu: `${lieu.ville}, ${lieu.rue}`,
  //     };

  //     // Envoi de l'email aux deux conducteurs
  //     await this.mailService.sendConstatEmail(
  //       conducteur1Email,
  //       conducteur2Email,
  //       constatDetails,
  //     );
  //   }
  //   await this.notificationService.envoyerNotificationTousAgentsDeService(
  //     `🔔 Monsieur ${savedConstat.user?.nom}  ${savedConstat.user?.prenom}a declaré un constat Veuillez consulter les détails.`,
  //   );
  //   // Retour du constat sauvegardé
  //   return savedConstat;
  // }

  // async getConstatsByUserId(userId: number): Promise<constat[]> {
  //   try {
  //     const constats = await this.constatRepository.find({
  //       where: { user: { id: userId } }, // Filtrer par ID de l'utilisateur
  //       relations: ['user', 'lieu', 'conducteur', 'temoins'],
  //       order: { dateAccident: 'DESC' }, // Charger les relations nécessaires
  //     });

  //     return constats; // Retourner tous les constats de cet utilisateur
  //   } catch (error) {
  //     console.error('Erreur lors de la récupération des constats:', error);
  //     throw new Error('Erreur lors de la récupération des constats');
  //   }
  // }
  // async getAllConstats(): Promise<constat[]> {
  //   try {
  //     const constats = await this.constatRepository.find({
  //       relations: ['user', 'lieu', 'conducteur', 'temoins'],
  //       order: { dateAccident: 'DESC' },
  //     });

  //     return constats;
  //   } catch (error) {
  //     console.error(
  //       'Erreur lors de la récupération de tous les constats:',
  //       error,
  //     );
  //     throw new Error('Erreur lors de la récupération de tous les constats');
  //   }
  // }

  // private readonly uploadPath = join(__dirname, '../../../upload/constat');

  // async saveFile(file: Express.Multer.File): Promise<string> {
  //   await fs.mkdir(this.uploadPath, { recursive: true });

  //   const safeName = file.originalname
  //     .replace(/[^\w.-]/g, '-')

  //     .replace(/\s+/g, '-');
  //   const fileName = `${Date.now()}-${safeName}`;
  //   const filePath = join(this.uploadPath, fileName);

  //   await fs.writeFile(filePath, file.buffer);

  //   return `/upload/constat/${fileName}`;
  // }

  // async updateConstatPath(
  //   constatId: number,
  //   pathurl: string,
  // ): Promise<constat> {
  //   const constat = await this.constatRepository.findOneBy({
  //     idConstat: constatId,
  //   });
  //   if (!constat) {
  //     throw new NotFoundException(`Constat ${constatId} non trouvé`);
  //   }

  //   constat.pathurl = pathurl;
  //   return this.constatRepository.save(constat);
  // }
  // async getConstatById(id: number): Promise<constat> {
  //   const constat = await this.constatRepository.findOne({
  //     where: { idConstat: id },
  //     relations: ['user', 'expert', 'expert.user'],
  //   });
  //   if (!constat) {
  //     throw new NotFoundException(`Constat avec l'ID ${id} non trouvé`);
  //   }
  //   return constat;
  // }

  // async addExpertToConstat(
  //   constatId: number,
  //   expertId: number,
  // ): Promise<constat> {
  //   const constat = await this.getConstatById(constatId);
  //   const expert = await this.expertRepository.findOneBy({ id: expertId });

  //   if (!expert) {
  //     throw new NotFoundException(`Expert avec l'ID ${expertId} non trouvé`);
  //   }

  //   constat.expert = expert;
  //   return this.constatRepository.save(constat);
  // }
  // async affecterExpertAConstat(
  //   expertId: number,
  //   constatId: number,
  //   agentId: number,
  // ): Promise<constat> {
  //   try {
  //     // 1. Get all necessary data in parallel
  //     const [updatedConstat, Agent, expert] = await Promise.all([
  //       this.addExpertToConstat(constatId, expertId),
  //       this.AgentServiceService.getAgentById(agentId),
  //       this.expertService.getExpertById(expertId),
  //     ]);

  //     if (!Agent?.user) {
  //       throw new NotFoundException('Agent user information not found');
  //     }

  //     // 2. Update expert's disponibilite to false and add constat
  //     await this.expertService.updateExpertDisponibilite(expertId, false);

  //     // 3. Execute parallel operations
  //     await Promise.all([
  //       this.expertService.ajouterConstatAExpert(expertId, constatId),
  //       this.AgentServiceService.ajouterConstatAgent(agentId, constatId),
  //     ]);

  //     // 4. Send notifications
  //     await Promise.all([
  //       this.notificationService.envoyerNotificationTousAgentsDeServiceSaufUn(
  //         `🔔 Monsieur ${Agent.user.nom} ${Agent.user.prenom} s'occuppe du constat n°${constatId}.`,
  //         Agent.user.id,
  //       ),
  //       this.notificationService.creerNotification(
  //         expert.user.id,
  //         `🔔 Nouvelle mission ! Vous avez été affecté(e) au constat n°${constatId}. Veuillez consulter les détails.`,
  //       ),
  //       updatedConstat.user &&
  //         this.notificationService.creerNotification(
  //           updatedConstat.user.id,
  //           `👨‍🔧 Un expert a été désigné pour votre constat n°${constatId} : ${expert.user.nom} ${expert.user.prenom}. Il prendra contact avec vous sous peu.`,
  //         ),
  //     ]);

  //     return updatedConstat;
  //   } catch (error) {
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //     console.error("Erreur lors de l'affectation:", error.stack);
  //     throw new BadRequestException(
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //       error.message || "Erreur lors de l'affectation de l'expert",
  //     );
  //   }
  // }
  // async programmerExpertise(
  //   constatId: number,
  //   date: Date,
  //   heure: string,
  //   lieu: string,
  //   commentaire: string,
  // ): Promise<{ constat: constat; message: string }> {
  //   try {
  //     // 1. Vérification des paramètres d'entrée
  //     if (!constatId || !date || !heure || !lieu) {
  //       throw new BadRequestException(
  //         'Paramètres manquants pour la programmation',
  //       );
  //     }

  //     // 2. Récupération du constat avec vérification des relations
  //     const constat = await this.constatRepository.findOne({
  //       where: { idConstat: constatId },
  //       relations: ['user', 'expert'], // Ajout de 'expert' si nécessaire
  //     });

  //     if (!constat) {
  //       throw new NotFoundException(`Constat ${constatId} non trouvé`);
  //     }

  //     if (!constat.user) {
  //       throw new BadRequestException(
  //         `Aucun utilisateur associé au constat ${constatId}`,
  //       );
  //     }

  //     // 3. Validation de la date
  //     if (isNaN(date.getTime())) {
  //       throw new BadRequestException('Date invalide');
  //     }

  //     // 4. Formatage de la date pour l'affichage
  //     const formattedDate = date.toLocaleDateString('fr-FR', {
  //       weekday: 'long',
  //       year: 'numeric',
  //       month: 'long',
  //       day: 'numeric',
  //     });

  //     // 5. Mise à jour complète du constat
  //     const updatedConstat = await this.constatRepository.save({
  //       ...constat,
  //       statut: ConstatStatut.EN_COURS, // Assurez-vous que ConstatStatut est correctement importé
  //     });

  //     // 6. Construction du message de notification
  //     const notificationMessage = this.buildNotificationMessage(
  //       constat.user.prenom,
  //       constatId,
  //       formattedDate,
  //       heure,
  //       lieu,
  //       commentaire,
  //     );

  //     // 7. Envoi de la notification
  //     await this.notificationService.creerNotification(
  //       constat.user.id,
  //       notificationMessage,
  //     );

  //     return {
  //       constat: updatedConstat,
  //       message: `Notification envoyée à ${constat.user.prenom} ${constat.user.nom} (${constat.user.email})`,
  //     };
  //   } catch (error) {
  //     console.error('Erreur détaillée:', {
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  //       error: error.message,
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  //       stack: error.stack,
  //       constatId,
  //       date,
  //       heure,
  //     });

  //     throw new BadRequestException({
  //       status: 'error',
  //       message: 'Erreur lors de la programmation',
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  //       details: error.message,
  //       timestamp: new Date().toISOString(),
  //     });
  //   }
  // }

  // private buildNotificationMessage(
  //   prenom: string,
  //   constatId: number,
  //   date: string,
  //   heure: string,
  //   lieu: string,
  //   commentaire?: string,
  // ): string {
  //   return `
  //     🚗 Programmation d'expertise confirmée
      
  //     Bonjour ${prenom},
  //     Votre expertise pour le constat #${constatId} a été programmée :
      
  //     📅 Date: ${date}
  //     ⏰ Heure: ${heure}
  //     📍 Lieu: ${lieu}
  //     ${commentaire ? `💬 Commentaire: ${commentaire}` : ''}
      
  //     Cordialement,
  //     L'équipe d'expertise
  //   `.replace(/^\s+/gm, '');
  // }
}
