import { Component } from '@angular/core';
import { NotificationService, Notification } from '../../agent-service/Services/notification.service';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  standalone: false,
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {
  notifications: Notification[] = [];
  userId!: number;
  selectedNotification: Notification | null = null;
  showDetailsModal: boolean = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.decodeUserIdFromToken();
    if (this.userId) {
      this.loadNotifications();
    }
  }

  handleNotificationClick(notification: Notification): void {
    // Marquer comme lue si ce n'est pas déjà fait
    if (!notification.isRead) {
      this.markAsRead(notification);
    }

    // Vérifier si c'est une notification de souscription acceptée (standard ou vie)
    if (notification.type === 'subscription_accepted' || notification.type === 'vie_subscription_accepted') {
      // Rechercher l'ID du contrat dans l'ordre de priorité
      const contractId = notification.contractId ||
                       (notification.metadata && notification.metadata.contratId);

      if (contractId) {
        // Naviguer vers la page de paiement appropriée en fonction du type
        if (notification.type === 'vie_subscription_accepted') {
          this.router.navigate([`/dashboard-assure/contratvie/${contractId}/payment`]);
        } else {
          this.router.navigate([`/dashboard-assure/contrat/${contractId}/payment`]);
        }
      } else if (notification.link) {
        // Si pas d'ID mais un lien est disponible
        this.router.navigateByUrl(notification.link);
      } else {
        console.error('Impossible de trouver l\'ID du contrat ou le lien pour le paiement');
      }
      return;
    }

    // Pour les autres types de notifications
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  proceedToPaymentFromList(notification: Notification): void {
    // Marquer comme lue si ce n'est pas déjà fait
    if (!notification.isRead) {
      this.markAsRead(notification);
    }

    // Déterminer l'ID du contrat à partir des propriétés disponibles
    const contractId = notification.contractId || notification.metadata?.contratId;

    if (contractId) {
      // Redirection en fonction du type de notification
      if (notification.type === 'vie_subscription_accepted') {
        this.router.navigate([`/dashboard-assure/contratvie/${contractId}/payment`]);
      } else {
        this.router.navigate([`/dashboard-assure/contrat/${contractId}/payment`]);
      }
    } else if (notification.link) {
      this.router.navigateByUrl(notification.link);
    } else {
      console.error('Impossible de trouver l\'ID du contrat ou le lien pour le paiement');
    }
  }

  proceedToPayment(): void {
    if (this.selectedNotification) {
      // Déterminer l'ID du contrat à partir des propriétés disponibles
      const contractId = this.selectedNotification.contractId ||
                        this.selectedNotification.metadata?.contratId;

      if (contractId) {
        // Redirection en fonction du type de notification
        if (this.selectedNotification.type === 'vie_subscription_accepted') {
          this.router.navigate([`/dashboard-assure/contratvie/${contractId}/payment`]);
        } else {
          this.router.navigate([`/dashboard-assure/contrat/${contractId}/payment`]);
        }
        this.closeModal();
      } else if (this.selectedNotification.link) {
        this.router.navigateByUrl(this.selectedNotification.link);
        this.closeModal();
      } else {
        console.error('Impossible de trouver l\'ID du contrat ou le lien pour le paiement');
      }
    }
  }

  closeModal(): void {
    this.showDetailsModal = false;
    this.selectedNotification = null;
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(
        () => {
          notification.isRead = true;
          // Stocker l'état dans le localStorage
          this.storeReadNotification(notification.id);
        },
        (error) => console.error('Erreur lors du marquage comme lu:', error)
      );
    }
  }

  showNotificationDetails(notification: Notification): void {
    this.selectedNotification = notification;

    // Si la notification n'est pas déjà lue, la marquer comme lue
    if (!notification.isRead) {
      this.markAsRead(notification);
    }

    this.showDetailsModal = true;
  }

  private decodeUserIdFromToken(): void {
    const token = this.getCookie('access_token');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userId = Number(decoded.sub);
    } else {
      console.error('Token non trouvé');
    }
  }

  private loadNotifications(): void {
    this.notificationService.getNotifications(this.userId).subscribe(
      (data) => {
        // Trier par date (plus récentes en premier)
        this.notifications = this.notificationService.sortNotificationsByDate(data);

        // Vérifier le localStorage pour les notifications marquées comme lues
        this.checkReadNotifications();
      },
      (error) => console.error('Erreur chargement notifications :', error)
    );
  }

  private storeReadNotification(notificationId: number): void {
    const readNotifications = this.getReadNotifications();
    if (!readNotifications.includes(notificationId)) {
      readNotifications.push(notificationId);
      localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
    }
  }

  private getReadNotifications(): number[] {
    const readNotifications = localStorage.getItem('readNotifications');
    return readNotifications ? JSON.parse(readNotifications) : [];
  }

  private checkReadNotifications(): void {
    const readNotifications = this.getReadNotifications();
    this.notifications.forEach(notification => {
      if (readNotifications.includes(notification.id)) {
        notification.isRead = true;
      }
    });
  }

  isSubscriptionAccepted(notification: Notification): boolean {
    return notification.type === 'subscription_accepted' || notification.type === 'vie_subscription_accepted';
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
}
