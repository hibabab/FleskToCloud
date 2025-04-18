import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Notification,NotificationService } from '../../agent-service/Services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: false,
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  userId!: number;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.decodeUserIdFromToken();
    if (this.userId) {
      this.loadNotifications();
    }
  }

  // Fonction pour récupérer le token et extraire l’ID de l’utilisateur
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
      (data) => this.notifications = data,
      (error) => console.error('Erreur chargement notifications :', error)
    );
  }

  // Lire les cookies
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
}
