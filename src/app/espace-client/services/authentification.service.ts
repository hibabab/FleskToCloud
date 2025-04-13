import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { UserDto } from '../models/userDto';

interface VerifyAdminResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {

  constructor(private http: HttpClient) {}
  readonly apiUrl = 'http://localhost:3000/auth';
 readonly adminApiUrl='http://localhost:3000/admin-gateway'
  // L'URL de l'API backend

  // Inscription (register)
  register(signupData: UserDto): Observable<any> {
    return this.http.post(`${this. apiUrl}/register`, signupData);
  }

  // Connexion (login)
  login(email: string,password:string): Observable<any> {
    const body = {email,password}
    return this.http.post(`${this. apiUrl}/login`, body);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }
  resetPassword(newPassword: string, resetToken: string): Observable<any> {
    const body = { newPassword, resetToken }; // Correction du nom de la propriété

    return this.http.post(`${this.apiUrl}/reset-password`, body);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getRole(userId: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/role/${userId}`);
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
