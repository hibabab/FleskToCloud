import { Component } from '@angular/core';
import { AuthentificationDto } from '../../models/authentification-dto';
import { AuthService } from '../../services/authentification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
   user: AuthentificationDto = {} as AuthentificationDto;
constructor(private authService: AuthService) {}

  onSubmit() {
    // Validation of fields
    if (!this.user.email ) {
      console.error('Tous les champs sont obligatoires.');
      return;
    }

    // Calling the AuthService method to register the user
    this.authService.forgotPassword(this.user.email).subscribe(
      (response) => {
        console.log('mot de passe oublié réussie:', response);
        // You can add a redirect or a success message here
      },
      (error) => {
        console.error('Erreur de mot de passe oublié:', error);
        // Handle the error, show an error message, etc.
      }
    );
  }

}
