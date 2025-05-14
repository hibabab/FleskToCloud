import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDto } from '../models/userDto';
import { AuthentificationService } from '../services/authentification.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  standalone:false,
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  user: UserDto = { password: '' } as UserDto;
  confirmPassword: string = ''; // Déclaré comme string simple
  resetToken: string = '';
  message: string = '';
  isSuccess: boolean = false;
  showMessage: boolean = false;

  constructor(
    private authService: AuthentificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit(): void {
    this.message = '';
    this.isSuccess = false;
    this.showMessage = false;

    if (!this.user.password) {
      this.showError('Veuillez entrer un nouveau mot de passe.');
      return;
    }

    if (!this.isPasswordValid(this.user.password)) {
      this.showError('Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.');
      return;
    }

    if (this.user.password !== this.confirmPassword) {
      this.showError('Les mots de passe ne correspondent pas.');
      return;
    }

    this.authService.resetPassword(this.user.password, this.resetToken).subscribe({
      next: () => {
        this.showSuccess('Mot de passe réinitialisé avec succès !');
        setTimeout(() => {
          this.router.navigate(['/espace-client/login']);
        }, 2000);
      },
      error: (error) => {
        const errorMessage = error.error?.message || 
                           error.message || 
                           'Une erreur inconnue est survenue';
        this.showError('Erreur : ' + errorMessage);
      }
    });
  }
 
  private isPasswordValid(password: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_=+#.])[A-Za-z\d@$!%*?&\-_=+#.]{8,}$/;
    return regex.test(password);
}
passwordsMatch(): boolean {
  return this.user.password === this.confirmPassword;
}
  private showSuccess(message: string): void {
    this.isSuccess = true;
    this.message = message;
    this.showMessage = true;
  }

  private showError(message: string): void {
    this.isSuccess = false;
    this.message = message;
    this.showMessage = true;
  }
}