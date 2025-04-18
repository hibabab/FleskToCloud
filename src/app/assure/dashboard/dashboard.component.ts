import { Component, OnInit } from '@angular/core';
import { UserDto } from '../models/user-dto';
import { UserService } from '../services/user-service.service';
import { jwtDecode } from 'jwt-decode';
import { NotificationService } from '../../agent-service/Services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: UserDto = {
    email: '',
    password: '',
    nom: '',
    prenom: '',
    Cin: '',
    telephone: '',
    adresse: {
      rue: '',
      ville: '',
      pays: '',
      codePostal: ''
    },
    date_naissance: new Date()
  };

  unreadNotificationsCount: number = 0; // Nouvelle propriété

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}


  // Fonction pour récupérer un cookie spécifique
  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  ngOnInit(): void {
    const token = this.getCookie('access_token');

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const userId = Number(decoded.sub); // Récupère l'ID utilisateur
        this.loadUserData(userId);
        this.loadUnreadNotifications(userId); // Ajoutez cette ligne
      } catch (error) {
        console.error('Erreur lors du décodage du token', error);
      }
    } else {
      console.error('Token JWT non trouvé');
    }
  }



  loadUnreadNotifications(userId: number): void {
    this.notificationService.getUnreadNotifications(userId).subscribe({
      next: (notifications) => {
        
        this.unreadNotificationsCount = notifications.length;
        console.log('Nombre de notifications non lues:', this.unreadNotificationsCount);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notifications non lues', error);
      }
    });
  }

  loadUserData(userId: number): void {
    this.userService.getUserById(userId).subscribe(
      (data: UserDto) => {
        this.user = data;
        console.log('Données utilisateur chargées', data);
      },
      (error) => {
        console.error('Erreur lors du chargement des données utilisateur', error);
      }
    );
  }
}
