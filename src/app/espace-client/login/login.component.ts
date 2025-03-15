import { Component } from '@angular/core';
import { AuthentificationService } from '../services/authentification.service';
import { Router } from '@angular/router'; // Importation du Router
import { AuthentificationDto } from '../models/authentification-dto';
import { jwtDecode } from 'jwt-decode';




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
        document.cookie = `access_token=${token}; path=/; secure; SameSite=Strict`;

        // Décodage du token JWT
        const decoded: any = jwtDecode(token);
        const id = decoded.sub;

        // Vérification du rôle de l'utilisateur après décodage du token
        this.authService.getRole(id).subscribe(
          (roleResponse) => {
            const role = roleResponse.name;
            if (role === 'assure') {
              this.router.navigate(['/dashboard-assure']); // Redirection vers le dashboard de l'assuré
            } else {
              // Redirection vers un autre tableau de bord
            }
          },
          (error) => {
            console.error('Erreur de récupération du rôle:', error);
            // Gérer l'erreur ici
          }
        );
      },
      (error) => {
        console.error('Erreur de login:', error);
        // Gérer l'erreur, afficher un message d'erreur, etc.
      }
    );
  }
}
