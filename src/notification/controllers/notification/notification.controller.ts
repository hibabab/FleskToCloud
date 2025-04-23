import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Put,
    HttpCode,
    HttpStatus,
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/services/notification/notification.service';


  
  @Controller('notificationgatway')
  export class NotificationgatwayController {
    constructor(private readonly notificationService: NotificationService) {}
  
    @Post('create')
    async createNotification(
      @Body() data: { 
        userId: number; 
        message: string; 
        status?: string  // Ajout du paramètre optionnel
      }
    ): Promise<NotificationEntity> {
      try {
        return await this.notificationService.creerNotification(
          data.userId, 
          data.message,
          data.status  // Passage du statut optionnel
        );
      } catch (error) {
        this.handleError(error, 'Erreur lors de la création de la notification');
      }
    }
  
    @Post('get')
    async getNotifications(@Body() data: { userId: number }): Promise<NotificationEntity[]> {
      try {
        return await this.notificationService.getNotificationsByUserId(data.userId);
      } catch (error) {
        this.handleError(error, 'Erreur lors de la récupération des notifications');
      }
    }
  
    @Post('notify-all')
    @HttpCode(HttpStatus.CREATED)
    async notifyAllUsers(
      @Body() data: { message: string; status?: string }
    ): Promise<NotificationEntity[]> {
      try {
        return await this.notificationService.envoyerNotificationTousAgentsDeService(
          data.message,
          data.status // Passage du statut optionnel
        );
      } catch (error) {
        this.handleError(error, "Erreur lors de l'envoi aux agents");
      }
    }
  
    @Post('subscription-request')
   
    async createSubscriptionRequest(@Body() data: { user: User; formData: any }): Promise<NotificationEntity> {
      try {
        return await this.notificationService.createSubscriptionRequest(data.user, data.formData);
      } catch (error) {
        this.handleError(error, 'Erreur lors de la création de la demande');
      }
    }
  
    @Get('pending-subscription-requests')
    async getPendingSubscriptionRequests(): Promise<NotificationEntity[]> {
      try {
        return await this.notificationService.getPendingSubscriptionRequests();
      } catch (error) {
        this.handleError(error, 'Erreur lors de la récupération des demandes');
      }
    }
  
    @Post('process-subscription-request')
    async processSubscriptionRequest(
      @Body() data: { agent: User; notificationId: number; decision: 'accept' | 'reject' }
    ): Promise<NotificationEntity> {
      try {
        return await this.notificationService.processSubscriptionRequest(
          data.agent,
          data.notificationId,
          data.decision
        );
      } catch (error) {
        this.handleError(error, 'Erreur lors du traitement de la demande');
      }
    }
  
    @Get('notification/:id')
    async getNotificationDetails(@Param('id') id: number): Promise<NotificationEntity> {
      try {
        return await this.notificationService.getNotificationById(id);
      } catch (error) {
        this.handleError(error, 'Erreur lors de la récupération de la notification');
      }
    }
  
    @Post('mark-as-read')
    async markAsRead(@Body() data: { notificationId: number }): Promise<NotificationEntity> {
      try {
        return await this.notificationService.markAsRead(data.notificationId);
      } catch (error) {
        this.handleError(error, 'Erreur lors du marquage comme lu');
      }
    }
  
    @Post('mark-multiple-as-read')
    async markMultipleAsRead(@Body() data: { notificationIds: number[] }): Promise<number> {
      try {
        return await this.notificationService.markMultipleAsRead(data.notificationIds);
      } catch (error) {
        this.handleError(error, 'Erreur lors du marquage multiple comme lu');
      }
    }
  
    @Post('get-unread')
  
    async getUnreadNotifications(@Body() data: { userId: number }): Promise<NotificationEntity[]> {
      try {
        return await this.notificationService.getUnreadNotifications(data.userId);
      } catch (error) {
        this.handleError(error, 'Erreur lors de la récupération des notifications non lues');
      }
    }
  
    @Post('notifications')
    async sendNotification(@Body() data: { 
      userId: number; 
      message: string;
      type?: string;
      link?: string;
      contractId?: number;
      metadata?: any;
    }): Promise<NotificationEntity> {
      try {
        const type = data.type || 'default_type'; // Valeur par défaut si undefined
    const link = data.link || ''; 
        return await this.notificationService.envoyerNotificationAvecLien(
          data.userId,
          data.message,
          type,
          link,
          data.contractId,
          data.metadata
        );
      } catch (error) {
        this.handleError(error, 'Erreur lors de la création de la notification avec lien');
      }
    }
    private handleError(error: Error, defaultMessage: string): never {
      if (error.message.includes('non trouv')) {
        throw new NotFoundException(error.message);
      }
      if (error.message.includes('invalide')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(`${defaultMessage}: ${error.message}`);
    }
    @Post('process-payment-notification')
async processPaymentNotification(
  @Body() data: { agent: User; notificationId: number }
): Promise<NotificationEntity> {
  try {
    return await this.notificationService.processPaymentNotification(
      data.agent,
      data.notificationId
    );
  } catch (error) {
    this.handleError(error, 'Erreur lors du traitement de la notification de paiement');
  }
}
  }