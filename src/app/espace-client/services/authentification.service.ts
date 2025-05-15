import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { UserDto } from '../models/userDto';
import { CookieService } from 'ngx-cookie-service';

// Interfaces pour les réponses d'API
interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

interface RoleResponse {
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {
  readonly apiUrl = 'http://localhost:3000/auth';
readonly adminApiUrl='http://localhost:3000/admin-gateway'
  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  // Inscription (register)
  register(signupData: UserDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/register2`, signupData);
  }

  // Login avec gestion des credentials
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true } // Active l'envoi des cookies
    ).pipe(
      tap((response: AuthResponse) => {
        if (response && response.access_token && response.refresh_token) {
          this.storeTokens(response.access_token, response.refresh_token);
        }
      })
    );
  }

  // Méthode pour stocker les tokens dans les cookies
  private storeTokens(accessToken: string, refreshToken: string) {
    // Calcul des dates d'expiration
    const accessExpires = new Date();
    accessExpires.setMinutes(accessExpires.getMinutes() + 60); // 60 minutes

    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 7); // 7 jours

    // Stockage des tokens avec ngx-cookie-service
    const secure = location.protocol === 'https:';
    const sameSite = 'Strict';
    const path = '/';

    this.cookieService.set('access_token', accessToken, accessExpires, path, undefined, secure, sameSite);
    this.cookieService.set('refresh_token', refreshToken, refreshExpires, path, undefined, secure, sameSite);
  }

  // Rafraîchissement du token
  refreshToken(): Observable<AuthResponse> {
    // Récupérer le refresh token des cookies
    const refreshToken = this.getRefreshTokenFromCookie();

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/refresh-token`,
      { refreshToken },
      { withCredentials: true }
    ).pipe(
      tap((response: AuthResponse) => {
        if (response && response.access_token && response.refresh_token) {
          this.storeTokens(response.access_token, response.refresh_token);
        }
      })
    );
  }

  // Récupérer le refresh token du cookie
  private getRefreshTokenFromCookie(): string | null {
    return this.cookieService.get('refresh_token') || null;
  }

  // Récupérer l'access token du cookie
  getAccessToken(): string | null {
    return this.cookieService.get('access_token') || null;
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return this.getAccessToken() !== null;
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(newPassword: string, resetToken: string): Observable<any> {
    const body = { newPassword, resetToken };
    return this.http.post(`${this.apiUrl}/reset-password`, body);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getRole(userId: number): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.apiUrl}/role/${userId}`);
  }

  confirmEmail(email: string, code: string): Observable<any> {
    const body = { email, code };
    return this.http.post(`${this.apiUrl}/confirm`, body);
  }

  logout() {
    // Supprimer les deux tokens des cookies avec ngx-cookie-service
    this.cookieService.delete('access_token', '/');
    this.cookieService.delete('refresh_token', '/');
  }
   verifyAdmin(email: string, password: string): Observable<boolean> {
    return this.http.post<{success: boolean}>(
      `${this.adminApiUrl}/verify`,
      { email, motDePasse: password }
    ).pipe(
      map(response => response.success),
      catchError(error => {
        // Si le backend retourne 400 (non admin), on considère que c'est false
        if (error.status === 400) {
          return of(false);
        }
        // Pour les autres erreurs, on propage
        return throwError(error);
      })
    );
  }
}
