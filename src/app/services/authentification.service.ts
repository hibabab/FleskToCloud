import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthentificationDto } from '../models/authentification-dto';
import { ResetPasswordDto } from '../models/reset-password-dto';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}
  readonly apiUrl = 'http://localhost:3000/auth';

  // L'URL de l'API backend

  // Inscription (register)
  register(signupData: AuthentificationDto): Observable<any> {
    return this.http.post(`${this. apiUrl}/register`, signupData);
  }

  // Connexion (login)
  login(credentials: AuthentificationDto): Observable<any> {
    return this.http.post(`${this. apiUrl}/login`, credentials);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }
  resetPassword(newPassword: string, resetToken: string): Observable<any> {
    const body = { newPassword, resetToken }; // Correction du nom de la propriété
  
    return this.http.put(`${this.apiUrl}/reset-password`, body);
  }
  
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

}
