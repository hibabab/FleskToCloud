import { Component, EventEmitter, Output } from '@angular/core';

import { AuthentificationService } from '../services/authentification.service';
import { UserDto } from '../models/userDto';



@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  @Output() closeModal = new EventEmitter<void>();
   user: UserDto = {} as UserDto;
constructor(private authService: AuthentificationService) {}
onClose() {
  this.closeModal.emit();
}
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
        this.onClose();
      },
      (error) => {
        console.error('Erreur de mot de passe oublié:', error);
        // Handle the error, show an error message, etc.
      }
    );
  }

}
