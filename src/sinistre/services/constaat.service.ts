import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { join } from 'path';
import { CannotExecuteNotConnectedError, EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { Expert } from 'src/gestion-utilisateur/entities/Expert.entity';
import { AdresseService } from './adresse-service.service';
import { TemoinService } from './temoin.service';
import { MailConstatService } from './mailconstat.service';
import { ConducteurService } from './conducteur.service';
import { ExpertService } from 'src/gestion-utilisateur/services/expert/expert.service';
import { AgentServiceService } from 'src/gestion-utilisateur/services/agent-service/agent-service.service';
import { NotificationService } from 'src/notification/services/notification/notification.service';
import { ConstatDto } from '../dto/constat-dto.dto';

import { constat } from '../entities/constat.entity';
import { ConstatStatut } from '../Enum/constat-statut.enum';
import { VehiculeService } from '../../assurance-auto/services/vehicule/vehicule.service';
import { PhotoJustificatif } from '../entities/photo.entity';
import { AgentService } from 'src/gestion-utilisateur/entities/AgentService.entity';
import { Vehicule } from 'src/assurance-auto/entities/Vehicule.entity';

@Injectable()
export class ConstatService {
  private readonly uploadPath = join(__dirname, '../../../upload/constat');

  constructor(
    @InjectRepository(constat)
    private readonly constatRepository: Repository<constat>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Expert)
    private readonly expertRepository: Repository<Expert>,
    private readonly adresseService: AdresseService,
    private readonly temoinService: TemoinService,
    private readonly VehiculeService: VehiculeService,
    private readonly mailService: MailConstatService,
    private readonly conducteurService: ConducteurService,
    private readonly expertService: ExpertService,
    private readonly agentService: AgentServiceService,
    private readonly notificationService: NotificationService,
  ) {}
  async createConstat(
    constatDto: ConstatDto,
    immatriculation: string,
    conducteur1Email: string,
    conducteur2Email?: string, // Made optional with ?
  ): Promise<constat> {
    try {
      // Find vehicle by immatriculation
       console.log('pathurl dans DTO:', constatDto.pathurl);
      const vehicule =
        await this.VehiculeService.findByImmatriculation(immatriculation);

      if (!vehicule) {
        throw new NotFoundException(
          `Vehicle with registration ${immatriculation} not found`,
        );
      }

      // Create or find location address
      const lieu = await this.adresseService.findOrCreate(constatDto.lieu);

      // Create conductor if provided in DTO
      const conducteur = constatDto.conducteur
        ? await this.conducteurService.create(constatDto.conducteur)
        : undefined;

      // Create witnesses if provided in DTO
      const temoins = constatDto.temoins
        ? await Promise.all(
            constatDto.temoins.map((temoinDto) =>
              this.temoinService.create(temoinDto),
            ),
          )
        : [];

      const photoEntities = constatDto.photos
        ? constatDto.photos.map((url) => {
            const photo = new PhotoJustificatif();
            photo.url = url;
            return photo;
          })
        : [];

      // Exclude photos from the DTO to avoid type issues
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
     const { photos: _, ...constatDataWithPathUrl } = constatDto;

// Création avec assignation explicite
const newConstat = this.constatRepository.create({
  ...constatDataWithPathUrl, // Contiendra pathurl
  lieu,
  conducteur,
  temoins,
  vehicule,
  photos: photoEntities,
  pathurl: constatDto.pathurl, // Assignation EXPLICITE
});
      // Save the constat (cascades to save photos)
      const savedConstat = await this.constatRepository.save(newConstat);

      // Add constat to vehicle
      await this.VehiculeService.ajouterConstatAuVehicule(
        vehicule.id,
        savedConstat.idConstat,
      );

      // Format date and time for email
      const dateAccidentFormatted = new Date(savedConstat.dateAccident)
        .toISOString()
        .split('T')[0];
      const heureFormatted = savedConstat.heure;

      // Get constat URL
      const constatUrl = savedConstat.pathurl
        ? `https://fleskcover.com${savedConstat.pathurl}`
        : 'URL non disponible encore';

      // Send email to both conductors if emails provided
      if (conducteur1Email && conducteur2Email) {
        const constatDetails = {
          date: dateAccidentFormatted,
          heure: heureFormatted,
          lieu: `${lieu.ville}, ${lieu.rue}`,
          constatUrl,
        };

        await this.mailService.sendConstatEmail(
          conducteur1Email,
          conducteur2Email,
          constatDetails,
        );
      }

      // Send notification to service agents
      if (vehicule.contratAuto?.assure?.user) {
        await this.notificationService.envoyerNotificationTousAgentsDeService(
          `🔔 Monsieur ${vehicule.contratAuto.assure.user.nom} ${vehicule.contratAuto.assure.user.prenom} a déclaré un constat. Veuillez consulter les détails.`,
        );
      }

      return savedConstat;
    } catch (error) {
      console.error('❌ Erreur lors de la création du constat:', error);
      throw error;
    }
  }
  async getUserConstats(userId: number): Promise<constat[]> {
    try {
      return this.constatRepository.find({
        where: {
          vehicule: { contratAuto: { assure: { user: { id: userId } } } },
        },
        relations: ['lieu', 'conducteur', 'temoins', 'vehicule'],
        order: { dateAccident: 'DESC' },
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des constats:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des constats',
      );
    }
  }

  // Get detailed constats where user is associated through vehicle ownership
  async getConstatsByUserId(userId: number): Promise<constat[]> {
    try {
      const constats = await this.constatRepository.find({
        where: {
          vehicule: { contratAuto: { assure: { user: { id: userId } } } },
        },
        relations: [
          'lieu',
          'conducteur',
          'temoins',
          'vehicule',
          'vehicule.contratAuto',
          'vehicule.contratAuto.assure',
          'vehicule.contratAuto.assure.user',
          'expert',
          'expert.user',
        ],
        order: { dateAccident: 'DESC' },
      });

      return constats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des constats:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des constats',
      );
    }
  }

  async getAllConstats(): Promise<constat[]> {
    try {
      const constats = await this.constatRepository.find({
        relations: [
          'lieu',
          'conducteur',
          'temoins',
          'vehicule',
          'vehicule.contratAuto.assure.user',
        ],
        order: { dateAccident: 'DESC' },
      });

      return constats;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération de tous les constats:',
        error,
      );
      throw new Error('Erreur lors de la récupération de tous les constats');
    }
  }

  async updateConstatPath(
    constatId: number,
    pathurl: string,
  ): Promise<constat> {
    const constat = await this.constatRepository.findOneBy({
      idConstat: constatId,
    });
    if (!constat) {
      throw new NotFoundException(`Constat ${constatId} non trouvé`);
    }

    constat.pathurl = pathurl;
    return this.constatRepository.save(constat);
  }

  async getConstatById(id: number): Promise<constat> {
    const constat = await this.constatRepository.findOne({
      where: { idConstat: id },
      relations: ['vehicule', 'expert', 'expert.user'],
    });
    if (!constat) {
      throw new NotFoundException(`Constat avec l'ID ${id} non trouvé`);
    }
    return constat;
  }

  async addExpertToConstat(
    constatId: number,
    expertId: number,
  ): Promise<constat> {
    const constat = await this.getConstatById(constatId);
    const expert = await this.expertRepository.findOneBy({ id: expertId });

    if (!expert) {
      throw new NotFoundException(`Expert avec l'ID ${expertId} non trouvé`);
    }

    constat.expert = expert;
    return this.constatRepository.save(constat);
  }

  

  async affecterExpertAConstat(
    expertId: number,
    constatId: number,
    agentId: number,
    commentaire?: string,
  ): Promise<constat> {
    try {
      const [updatedConstat, agent, expert] = await Promise.all([
        this.addExpertToConstat(constatId, expertId),
        this.agentService.getAgentById2(agentId),
        this.expertService.getExpertById2(expertId),
      ]);
  
      if (!agent?.user) {
        throw new NotFoundException('Agent user information not found');
      }
  
      await this.expertService.updateExpertDisponibilite(expertId, false);
  
      await Promise.all([
        this.expertService.ajouterConstatAExpert(expertId, constatId),
        this.agentService.ajouterConstatAgent(agentId, constatId),
      ]);
  
      updatedConstat.statut = ConstatStatut.AFFECTE;
      await this.constatRepository.save(updatedConstat);
  
      const messageExpert = commentaire
        ? `🔔 Nouvelle mission ! Vous avez été affecté(e) au constat n°${constatId}. Commentaire : "${commentaire}" Veuillez consulter les détails.`
        : `🔔 Nouvelle mission ! Vous avez été affecté(e) au constat n°${constatId}. Veuillez consulter les détails.`;
  
      // Get vehicle owner information correctly from updatedConstat
      const vehicleOwner = updatedConstat.vehicule?.contratAuto?.assure?.user;
  
      // Prepare notification promises
      const notificationPromises = [
        this.notificationService.envoyerNotificationTousAgentsDeServiceSaufUn(
          `🔔 Monsieur ${agent.user.nom} ${agent.user.prenom} s'occupe du constat n°${constatId}.`,
          agent.user.id,
        ),
        this.notificationService.creerNotification(
          expert.user.id,
          messageExpert,
        ),
      ];
  
      // Add vehicle owner notification if exists
      if (vehicleOwner) {
        notificationPromises.push(
          this.notificationService.creerNotification(
            vehicleOwner.id,
            `👨‍🔧 Un expert a été désigné pour votre constat n°${constatId} : ${expert.user.nom} ${expert.user.prenom}. Il prendra contact avec vous sous peu.`,
          ),
        );
      }
  
      // Execute all notifications
      await Promise.all(notificationPromises);
  
      const constatComplet = await this.getConstatAvecRelations(
        updatedConstat.idConstat,
      );
      if (!constatComplet) {
        throw new NotFoundException('Constat non trouvé avec les relations');
      }
      return constatComplet;
    } catch (error) {
      console.error("Erreur lors de l'affectation:", error.stack);
      throw new BadRequestException(
        error.message || "Erreur lors de l'affectation de l'expert",
      );
    }
  }
async getConstatAvecRelations(id: number): Promise<constat> {
  const constat = await this.constatRepository.findOne({
    where: { idConstat: id },
    relations: [
      'vehicule',
      'vehicule.contratAuto',
      'vehicule.contratAuto.assure',
      'vehicule.contratAuto.assure.user',
      'expert',
      'expert.user',
      'agentService',
      'temoins',
      'photos',
      'conducteur',
      'agentService.user',
    ],
  });

  if (!constat) {
    throw new NotFoundException(`Constat ${id} introuvable`);
  }

  return constat;
}


  async programmerExpertise(
    constatId: number,
    date: Date,
    heure: string,
    lieu: string,
    commentaire?: string,
  ): Promise<{ constat: constat; message: string }> {
    try {
      if (!constatId || !date || !heure || !lieu) {
        throw new BadRequestException(
          'Paramètres manquants pour la programmation',
        );
      }

      const constat = await this.constatRepository.findOne({
        where: { idConstat: constatId },
        relations: [
          'vehicule',
          'vehicule.contratAuto',
          'vehicule.contratAuto.assure',
          'vehicule.contratAuto.assure.user',
          'expert',
          'expert.user',
          'agentService',
          'agentService.user',
        ],
      });

      if (!constat) {
        throw new NotFoundException(`Constat ${constatId} non trouvé`);
      }

      const vehicleOwner = constat.vehicule?.contratAuto?.assure?.user;
      if (!vehicleOwner) {
        throw new BadRequestException(
          `Aucun utilisateur associé au constat ${constatId}`,
        );
      }

      if (isNaN(date.getTime())) {
        throw new BadRequestException('Date invalide');
      }

      const formattedDate = date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const updatedConstat = await this.constatRepository.save({
        ...constat,
        statut: ConstatStatut.EN_COURS,
      });

      const notificationMessage = this.buildNotificationMessage(
        vehicleOwner.prenom,
        constatId,
        formattedDate,
        heure,
        lieu,
        commentaire ? `Commentaire: ${commentaire}\n` : '',
      );

      await this.notificationService.creerNotification(
        vehicleOwner.id,
        notificationMessage,
      );

      return {
        constat: updatedConstat,
        message: `Notification envoyée à ${vehicleOwner.prenom} ${vehicleOwner.nom} (${vehicleOwner.email})`,
      };
    } catch (error) {
      console.error('Erreur détaillée:', {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error: error.message,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        stack: error.stack,
        constatId,
        date,
        heure,
      });

      throw new BadRequestException({
        status: 'error',
        message: 'Erreur lors de la programmation',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private buildNotificationMessage(
    prenom: string,
    constatId: number,
    date: string,
    heure: string,
    lieu: string,
    commentaire?: string,
  ): string {
    return `
      🚗 Programmation d'expertise confirmée
      
      Bonjour ${prenom},
      Votre expertise pour le constat #${constatId} a été programmée :
      
      📅 Date: ${date}
      ⏰ Heure: ${heure}
      📍 Lieu: ${lieu}
      ${commentaire ? `💬 Commentaire: ${commentaire}` : ''}
      
      Cordialement,
      L'équipe d'expertise
    `.replace(/^\s+/gm, '');
  }

  async estimerConstatParExpert(
    constatId: number,
    montant: number,
    degats: string,
    rapportUrl: string,
    commentaire?: string,
  ): Promise<constat> {
    if (!montant || montant <= 0)
      throw new BadRequestException('Le montant doit être positif');
    if (!degats?.trim())
      throw new BadRequestException(
        'La description des dégâts est obligatoire',
      );

    const constat = await this.constatRepository.findOne({
      where: { idConstat: constatId },
      relations: [
        'vehicule',
        'vehicule.contratAuto',
        'vehicule.contratAuto.assure',
        'vehicule.contratAuto.assure.user',
        'expert',
        'expert.user',
        'agentService',
        'agentService.user',
      ],
    });

    if (!constat)
      throw new NotFoundException(`Constat ${constatId} non trouvé`);

    // Explicitly type the array as string[]
    const missingRelations: string[] = [];
    if (!constat.vehicule?.contratAuto?.assure?.user)
      missingRelations.push('vehicule.contratAuto.assure.user');
    if (!constat.expert?.user) missingRelations.push('expert.user');
    if (!constat.agentService?.user) missingRelations.push('agentService.user');

    if (missingRelations.length > 0) {
      throw new BadRequestException(
        `Relations manquantes: ${missingRelations.join(', ')} pour le constat ${constatId}`,
      );
    }

    const vehicleOwner = constat.vehicule.contratAuto.assure.user;
    if (!vehicleOwner || !constat.expert?.user || !constat.agentService?.user) {
      throw new Error('Unexpected null values after validation');
    }

    constat.statut = ConstatStatut.ESTIME;
    constat.rapportUrl = rapportUrl;
    const updatedConstat = await this.constatRepository.save(constat);

    await this.notificationService.creerNotification(
      constat.agentService.user.id,
      `✅ Expert ${constat.expert.user.nom} a estimé le constat #${constat.idConstat} de ${vehicleOwner.nom} ${vehicleOwner.prenom}
       Montant: ${montant}€
       Dégâts: ${degats}
       ${commentaire ? `Commentaire: ${commentaire}` : ''}`,
    );

    return updatedConstat;
  }

  async estimerMontantParAgent(
    constatId: number,
    agentId: number,
    montant: number,
    degats?: string,
    commentaire?: string,
  ): Promise<constat> {
    // Validation des paramètres obligatoires
    if (!montant || montant <= 0) {
      throw new BadRequestException('Le montant doit être positif');
    }

    if (!agentId) {
      throw new BadRequestException('Agent ID requis');
    }

    // Récupération parallèle des données
    const [constat, agent] = await Promise.all([
      this.constatRepository.findOne({
        where: { idConstat: constatId },
        relations: [
          'vehicule',
          'vehicule.contratAuto',
          'vehicule.contratAuto.assure',
          'vehicule.contratAuto.assure.user',
          'agentService',
          'agentService.user',
        ],
      }),
      this.agentService.getAgentById(agentId),
    ]);

    // Vérification des entités
    if (!constat) {
      throw new NotFoundException(`Constat ${constatId} introuvable`);
    }

    if (!agent?.user) {
      throw new NotFoundException(`Agent ${agentId} introuvable`);
    }

    const vehicleOwner = constat.vehicule?.contratAuto?.assure?.user;
    if (!vehicleOwner) {
      throw new BadRequestException('Propriétaire du véhicule introuvable');
    }

    // Mise à jour du constat
    constat.montantEstime = montant;
    constat.statut = ConstatStatut.CLOTURE;
    const updatedConstat = await this.constatRepository.save(constat);

    // Préparation du message
    const messageLines = [
      `💰 Estimation effectuée par ${agent.user.nom} ${agent.user.prenom}`,
      `📋 Montant estimé : ${montant}€`,
      degats && `🛠 Dégâts constatés : ${degats}`,
      commentaire && `📝 Commentaire : ${commentaire}`,
    ].filter(Boolean);

    try {
      await this.notificationService.creerNotification(
        vehicleOwner.id,
        messageLines.join('\n'),
      );
    } catch (notifError) {
      console.error('Erreur de notification:', notifError);
    }

    return updatedConstat;
  }

  async getConstatsByImatriculation(
    imatriculation: string,
  ): Promise<constat[]> {
    return this.constatRepository
      .createQueryBuilder('constat')
      .leftJoinAndSelect('constat.vehicule', 'vehicule')
      .where('vehicule.Imat = :imat', { imat: imatriculation })
      .orderBy('constat.dateAccident', 'DESC')
      .addOrderBy('constat.heure', 'DESC')
      .getMany();
  }
}
