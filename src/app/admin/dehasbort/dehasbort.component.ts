import { Component } from '@angular/core';
import { UserDto } from '../../assure/models/user-dto';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../../assure/services/user-service.service';
import { NotificationService } from '../../agent-service/Services/notification.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthentificationService } from '../../espace-client/services/authentification.service';

@Component({
  selector: 'app-dehasbort',
  standalone: false,
  templateUrl: './dehasbort.component.html',
  styleUrl: './dehasbort.component.css'
})
export class DehasbortComponent {
  homeIcon = 'Home';
  usersIcon = 'Users';
  briefcaseIcon = 'Briefcase';
  userIcon = 'User';
  showUserListFlag: boolean = false;
 constructor(private http: HttpClient, private router: Router,private authService: AuthentificationService, private userService: UserService) {}
 showLogoutModal: boolean = false; // Propriété pour contrôler l'affichage du modal



  // Fonction pour récupérer un cookie spécifique

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
  showUserList() {
    this.showUserListFlag = true;
  }

}
