import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  // Injection du repository NotificationEntity
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Méthode pour créer une notification
  async creerNotification(
    userId: number,
    message: string,
  ): Promise<NotificationEntity> {
    try {
      // Créer une nouvelle notification
      const notification = new NotificationEntity();
      notification.message = message;

      // Associer l'utilisateur à la notification
      notification.user = { id: userId } as User; // On utilise le type User pour une meilleure sécurité de type

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
  ): Promise<NotificationEntity[]> {
    try {
      // On suppose que les agents de service ont le rôle 'AGENT_SERVICE'
      const agents = await this.userRepository.find({
        where: { role: 'agent service' },
      });

      if (!agents.length) {
        return []; // Retourner un tableau vide plutôt que de throw une erreur
      }

      // Créer les notifications en utilisant la méthode creerNotification
      const notificationsPromises = agents.map((agent) =>
        this.creerNotification(agent.id, message),
      );

      // Attendre que toutes les notifications soient créées
      return await Promise.all(notificationsPromises);
    } catch (error) {
      console.error('Erreur lors de lenvoi des Notification:', error);
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
        order: { createdAt: 'ASC' }
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
}
