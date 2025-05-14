import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { NotificationService } from '../../agent-service/Services/notification.service';
import { UserDto } from '../../assure/models/user-dto';
import { UserService } from '../../assure/services/user-service.service';

import { Router } from '@angular/router';
import { AuthentificationService } from '../../espace-client/services/authentification.service';

@Component({
  selector: 'app-dashbort',
  standalone: false,
  templateUrl: './dashbort.component.html',
  styleUrl: './dashbort.component.css'
})
export class DashbortComponent implements OnInit {
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

  unreadNotificationsCount: number = 0;
  showLogoutModal: boolean = false; // Propriété pour contrôler l'affichage du modal

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private authService: AuthentificationService, // Injection du service d'authentification
    private router: Router // Injection du router
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
        this.loadUnreadNotifications(userId);
      } catch (error) {
        console.error('Erreur lors du décodage du token', error);
      }
    } else {
      console.error('Token JWT non trouvé');
      this.router.navigate(['/espace-client/login']); // Redirection vers la page de login si pas de token
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

  // Afficher le modal de déconnexion
  logout(): void {
    this.showLogoutModal = true;
  }

  // Annuler la déconnexion
  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  // Confirmer la déconnexion
  confirmLogout(): void {
    this.authService.logout(); // Appel à la méthode de déconnexion du service
    this.showLogoutModal = false;
    this.router.navigate(['/espace-client/login']); // Redirection vers la page de login
  }
}