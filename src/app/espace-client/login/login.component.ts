import { Component } from '@angular/core';

import { AuthentificationDto } from '../../models/authentification-dto';
import { AuthService } from '../../services/authentification.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // Fix typo here as 'styleUrl' should be 'styleUrls'
})
export class LoginComponent {
  user: AuthentificationDto = {} as AuthentificationDto;

  constructor(private authService: AuthService) {}

  onSubmit() {
    // Validation of fields
    if (!this.user.email || !this.user.password) {
      console.error('Tous les champs sont obligatoires.');
      return;
    }

    // Calling the AuthService method to register the user
    this.authService.login(this.user).subscribe(
      (response) => {
        console.log('login réussie:', response);
        // You can add a redirect or a success message here
      },
      (error) => {
        console.error('Erreur de login:', error);
        // Handle the error, show an error message, etc.
      }
    );
  }
}
