import { Component } from '@angular/core';
import { AuthentificationService } from '../services/authentification.service';
import { Router } from '@angular/router'; // Importation du Router
import { AuthentificationDto } from '../models/authentification-dto';
import { jwtDecode } from 'jwt-decode';
import { catchError } from 'rxjs/operators'; // Importation de catchError
import { of } from 'rxjs'; // Importation de of

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // Correction de 'styleUrl' à 'styleUrls'
})
export class LoginComponent {
  user: AuthentificationDto = {} as AuthentificationDto;

  constructor(
    private authService: AuthentificationService,
    private router: Router 
  ) {}

  // Méthode exécutée lors de la soumission du formulaire de login
  onSubmit() {
    // Validation des champs
    if (!this.user.email || !this.user.password) {
      console.error('Tous les champs sont obligatoires.');
      return;
    }

    // Appel de la méthode login dans le AuthentificationService
    this.authService.login(this.user.email, this.user.password).subscribe(
      (response) => {
        console.log('Login réussi:', response);

        // Récupération du token
        const token = response.access_token;
        console.log('Token reçu:', token);

        // Enregistrement du token dans un cookie
        this.setTokenInCookie(token);

        // Décodage du token JWT pour obtenir l'ID utilisateur
        const decoded: any = jwtDecode(token);
        const userId = decoded.sub;

        // Vérification du rôle de l'utilisateur après décodage du token
        this.authService.getRole(userId).pipe(
          catchError((error) => {
            console.error('Erreur de récupération du rôle:', error);
            // Retourne un rôle par défaut si une erreur se produit
            return of({ role: 'user' });
          })
        ).subscribe(
          (roleResponse) => this.handleRoleResponse(roleResponse)
        );
      },
      (error) => {
        console.error('Erreur de login:', error);
        // Vous pouvez ajouter un message d'erreur à afficher à l'utilisateur
      }
    );
  }

  // Méthode pour enregistrer le token dans un cookie
  private setTokenInCookie(token: string) {
    document.cookie = `access_token=${token}; path=/; secure; SameSite=Strict`;
  }

  // Méthode pour gérer la réponse contenant le rôle de l'utilisateur
  private handleRoleResponse(roleResponse: any) {
    if (roleResponse && roleResponse.role) {
      const role = roleResponse.role;

      // Navigation en fonction du rôle
      if (role === 'assure' || role === 'user') {
        this.router.navigate(['/dashboard-assure']);
      } else {
        console.error('Rôle de l\'utilisateur inconnu:', role);
      }
    } else {
      console.error('Réponse inattendue du serveur:', roleResponse);
    }
  }
}
