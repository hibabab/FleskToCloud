import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthentificationService } from '../../espace-client/services/authentification.service';
import { UserService } from '../../assure/services/user-service.service';

@Component({
  selector: 'app-interface-admin',
  standalone: false,
  templateUrl: './interface-admin.component.html',
  styleUrl: './interface-admin.component.css'
})
export class InterfaceAdminComponent implements OnInit {
  expertsCount: number = 0;
  agentsCount: number = 0;
  usersCount: number = 0;
  assureVieCount: number = 0;
  assureAutoCount: number = 0;

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

  ngOnInit(): void {
    this.fetchCounts();
  }

  fetchCounts() {
    // Récupérer le nombre d'experts
    this.http.get<number>('http://localhost:3000/expert/count').subscribe(
      (count) => { this.expertsCount = count; },
      (error) => { console.error('Erreur lors de la récupération du nombre d\'experts:', error); }
    );

    // Récupérer le nombre d'agents de service
    this.http.get<number>('http://localhost:3000/agent-service/count').subscribe(
      (count) => { this.agentsCount = count; },
      (error) => { console.error('Erreur lors de la récupération du nombre d\'agents de service:', error); }
    );

    // Récupérer le nombre d'utilisateurs
    this.http.get<number>('http://localhost:3000/user-gateway/users/count').subscribe(
      (count) => { this.usersCount = count; },
      (error) => { console.error('Erreur lors de la récupération du nombre d\'utilisateurs:', error); }
    );

    // Récupérer le nombre d'assurés vie
    this.http.get<number>('http://localhost:3000/assure-vie/count').subscribe(
      (count) => { this.assureVieCount = count; },
      (error) => { console.error('Erreur lors de la récupération du nombre d\'assurés vie:', error); }
    );

    // Récupérer le nombre d'assurés auto
    this.http.get<number>('http://localhost:3000/assures/count').subscribe(
      (count) => { this.assureAutoCount = count; },
      (error) => { console.error('Erreur lors de la récupération du nombre d\'assurés auto:', error); }
    );
  }


  navigateToAddExpert(): void {
    this.router.navigate(['/admin/Expert']);
  }

  navigateToAddAgent(): void {
    this.router.navigate(['/admin/agent-service']);
  }
  navigateToPublish(): void {
    this.router.navigate(['/admin/publier']);
  }
}
