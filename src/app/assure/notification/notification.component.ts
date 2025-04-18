import { Component } from '@angular/core';
import { NotificationService ,Notification} from '../../agent-service/Services/notification.service';
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

  // Dans le composant côté demandeur
handleNotificationClick(notification: Notification): void {
  // Marquer comme lue si ce n'est pas déjà fait
  if (!notification.isRead) {
    this.notificationService.markAsRead(notification.id).subscribe(() => {
      notification.isRead = true;
    });
  }

  // Vérifier si c'est une notification de souscription acceptée
  if (notification.type === 'subscription_accepted') {
    // Rechercher l'ID du contrat dans l'ordre de priorité
    const contractId = notification.contractId ||
                      (notification.metadata && notification.metadata.contratId);

    if (contractId) {
      // Naviguer vers la page de paiement avec l'ID du contrat
      this.router.navigate([`/dashboard-assure/contrat/${contractId}/payment`]);
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
  // Nouvelle méthode pour rediriger directement depuis la liste sans ouvrir le modal
  proceedToPaymentFromList(notification: Notification): void {
    // Marquer comme lue si ce n'est pas déjà fait
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.isRead = true;
      });
    }

    // Déterminer l'ID du contrat à partir des propriétés disponibles
    const contractId = notification.contractId || notification.metadata?.contratId;

    if (contractId) {
      this.router.navigate([`/dashboard-assure/contrat/${contractId}/payment`]);
    } else if (notification.link) {
      this.router.navigateByUrl(notification.link);
    } else {
      console.error('Impossible de trouver l\'ID du contrat ou le lien pour le paiement');
    }
  }

  // Rediriger vers le paiement avec un identifiant de contrat valide
  proceedToPayment(): void {
    if (this.selectedNotification) {
      // Déterminer l'ID du contrat à partir des propriétés disponibles
      const contractId = this.selectedNotification.contractId ||
                        this.selectedNotification.metadata?.contratId;

      if (contractId) {
        this.router.navigate([`/dashboard-assure/contrat/${contractId}/payment`]);
        this.closeModal();
      } else if (this.selectedNotification.link) {
        this.router.navigateByUrl(this.selectedNotification.link);
        this.closeModal();
      } else {
        console.error('Impossible de trouver l\'ID du contrat ou le lien pour le paiement');
      }
    }
  }

  // Fermer le modal
  closeModal(): void {
    this.showDetailsModal = false;
    this.selectedNotification = null;
  }

  showNotificationDetails(notification: Notification): void {
    this.selectedNotification = notification;

    // Si la notification n'est pas déjà lue, la marquer comme lue
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.isRead = true;
      });
    }

    this.showDetailsModal = true;
  }

  // Fonction pour récupérer le token et extraire l'ID de l'utilisateur
  private decodeUserIdFromToken(): void {
    const token = this.getCookie('access_token');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userId = Number(decoded.sub);
    } else {
      console.error('Token non trouvé');
    }
  }

  // Récupérer les notifications
  private loadNotifications(): void {
    this.notificationService.getNotifications(this.userId).subscribe(
      (data) => {
        // Trier par date (plus récentes en premier)
        this.notifications = this.notificationService.sortNotificationsByDate(data);
      },
      (error) => console.error('Erreur chargement notifications :', error)
    );
  }

  // Vérifier si une notification est une notification de souscription acceptée
  isSubscriptionAccepted(notification: Notification): boolean {
    return notification.type === 'subscription_accepted';
  }

  // Lire les cookies
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
}
