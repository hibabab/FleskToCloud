import { Component, EventEmitter, Output } from '@angular/core';
import { AuthentificationService } from '../services/authentification.service';
import { UserDto } from '../models/userDto';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  standalone:false,
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  @Output() closeModal = new EventEmitter<void>();
  user: UserDto = { email: '' } as UserDto;
  message: string = '';
  isSuccess: boolean = false;
  isLoading: boolean = false;

  constructor(private authService: AuthentificationService) {}

  onClose() {
    this.closeModal.emit();
  }

  onSubmit() {
    this.isLoading = true;
    this.message = '';
    this.isSuccess = false;

    if (!this.user.email) {
      this.message = 'Veuillez entrer votre adresse email';
      this.isLoading = false;
      return;
    }

    this.authService.forgotPassword(this.user.email).subscribe({
      next: () => {
        this.isSuccess = true;
        this.message = 'Si votre adresse email est correcte, vous recevrez un lien de réinitialisation dans quelques minutes.';
        this.isLoading = false;
        // Optionally auto-close after success
        setTimeout(() => this.onClose(), 3000);
      },
      error: (error) => {
        this.isSuccess = false;
        this.message = error.error?.message || 
                       'Une erreur est survenue lors de l\'envoi du lien de réinitialisation';
        this.isLoading = false;
      }
    });
  }
}