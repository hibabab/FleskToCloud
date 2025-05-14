import { Component } from '@angular/core';
import { AuthentificationService } from '../services/authentification.service';
import { Router } from '@angular/router';
import { AuthentificationDto } from '../models/authentification-dto';
import { jwtDecode } from 'jwt-decode';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user: AuthentificationDto = {} as AuthentificationDto;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthentificationService,
    private router: Router
  ) {}

  onSubmit() {
    // Réinitialisation des messages
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // Validation des champs
    if (!this.user.email || !this.user.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      this.isLoading = false;
      return;
    }

    this.authService.login(this.user.email, this.user.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Connexion réussie!';
        
        // Le stockage des tokens est maintenant géré par le service d'authentification
        // Nous n'avons plus besoin d'appeler une méthode séparée ici

        const decoded: any = jwtDecode(response.access_token);
        const userId = decoded.sub;

        this.authService.getRole(userId).pipe(
          catchError((error) => {
            console.error('Erreur de récupération du rôle:', error);
            return of({ role: 'user' });
          })
        ).subscribe({
          next: (roleResponse) => this.handleRoleResponse(roleResponse),
          error: (error) => {
            this.errorMessage = 'Erreur lors de la vérification du rôle';
            console.error(error);
          }
        });
      },
     error: (error) => {
  this.isLoading = false;
  if (error.status === 401) {
    this.errorMessage = 'Identifiants incorrects. Veuillez vérifier vos identifiants.';
  } else if (error.status === 403) {
    this.errorMessage = 'Votre compte a été bloqué. Veuillez contacter l\'administrateur.';
  } else {
    this.errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';
  }
  console.error('Erreur de login:', error);
}

    });
  }

  private handleRoleResponse(roleResponse: any) {
    if (roleResponse && roleResponse.role) {
      const role = roleResponse.role;

      switch(role) {
        case 'assure':
        case 'user':
          this.router.navigate(['/dashboard-assure']);
          break;
        case 'agent service':
          this.router.navigate(['/agent/dashbort-agent']);
          break;
        case 'expert':
          this.router.navigate(['/expert/dashboard-expert']);
          break;
        case 'admin':
          this.router.navigate(['/admin/interface']);
          break;
        default:
          this.errorMessage = 'Rôle utilisateur non reconnu';
          console.error('Rôle de l\'utilisateur inconnu:', role);
      }
    } else {
      this.errorMessage = 'Erreur de configuration du profil';
      console.error('Réponse inattendue du serveur:', roleResponse);
    }
  }
}