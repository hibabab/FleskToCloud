import { Component } from '@angular/core';
import { AuthentificationService } from '../services/authentification.service';
import { Router } from '@angular/router';
import { AuthentificationDto } from '../models/authentification-dto';
import { jwtDecode } from 'jwt-decode';
import { catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user: AuthentificationDto = {} as AuthentificationDto;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private authService: AuthentificationService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.user.email || !this.user.password) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.verifyAdmin(this.user.email, this.user.password).pipe(
      switchMap(isAdmin => {
        if (isAdmin) {
          // Si admin, on redirige directement sans appel login supplémentaire
          this.router.navigate(['/admin/interface']);
          return of({ role: 'admin' });
        } else {
          return this.authService.login(this.user.email, this.user.password).pipe(
            switchMap(response => {
              this.handleLoginSuccess(response);
              const decoded: any = jwtDecode(response.access_token);
              return this.authService.getRole(decoded.sub).pipe(
                catchError(() => of({ role: 'user' }))
              );
            })
          );
        }
      })
    ).subscribe({
      next: (roleResponse) => {
        this.handleRoleResponse(roleResponse);
        this.isLoading = false;
      },
      error: (error) => {
        this.handleLoginError(error);
        this.isLoading = false;
      }
    });
  }

  private handleLoginSuccess(response: any) {
    const token = response.access_token;
    this.setTokenInCookie(token);
  }

  private handleRoleResponse(roleResponse: any) {
    if (!roleResponse?.role) {
      this.errorMessage = 'Impossible de déterminer votre rôle.';
      return;
    }

    switch (roleResponse.role.toLowerCase()) {
      case 'admin':
        this.router.navigate(['/admin/interface']);
        break;
      case 'assure':
      case 'user':
        this.router.navigate(['/dashboard-assure/interface']);
        break;
      case 'agent service':
        this.router.navigate(['/agent/interface']);
        break;
      case 'expert':
        this.router.navigate(['/dashboard-expert']);
        break;
      default:
        this.errorMessage = 'Votre rôle ne permet pas d\'accéder à cette application.';
        console.error('Rôle inconnu:', roleResponse.role);
    }
  }

  private handleLoginError(error: any) {
    console.error('Erreur de connexion:', error);
    this.errorMessage = error.error?.message ||
      (error.status === 401 ? 'Identifiants incorrects' : 'Erreur lors de la connexion. Veuillez réessayer.');
  }

  private setTokenInCookie(token: string) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000)); // 24h
    document.cookie = `access_token=${token}; expires=${expires.toUTCString()}; path=/; secure; SameSite=Strict`;
  }
}
