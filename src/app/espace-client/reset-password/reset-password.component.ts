import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authentification.service';
import { AuthentificationDto } from '../../models/authentification-dto';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  user: AuthentificationDto = {} as AuthentificationDto;
  resetToken: string = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer le token depuis l'URL
    this.resetToken = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit(): void {
    if (!this.user.password) {
      alert('Veuillez entrer un nouveau mot de passe.');
      return;
    }

    this.authService.resetPassword(this.user.password, this.resetToken).subscribe(
      () => {
        alert('Mot de passe réinitialisé avec succès !');
        this.router.navigate(['/espace-client/login']);
      },
      error => {
        alert('Erreur : ' + error.error.message);
      }
    );
  }
}

