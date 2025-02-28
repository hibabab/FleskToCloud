import { Component } from '@angular/core';
import { AuthentificationService } from '../../Core/Services/authentification.service';
import { AuthentificationDto } from '../models/authentificationDto';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  // Initialisation avec des valeurs par défaut pour l'objet user
  user: AuthentificationDto = {} as AuthentificationDto;

  constructor(private authService: AuthentificationService) {}

  // Méthode pour soumettre le formulaire d'inscription
  onSubmit() {
    if (!this.user.email || !this.user.name || !this.user.password) {
      console.error('Tous les champs sont obligatoires.');
      return;
    }

    this.authService.register(this.user).subscribe(
      (response) => {
        console.log('Inscription réussie:', response);
        // Vous pouvez ajouter une redirection o
        // u un message de succès ici
      },
      (error) => {
        console.error('Erreur d\'inscription:', error);
        // Affichage de l'erreur dans la console ou autre gestion
      }
    );
  }
}
