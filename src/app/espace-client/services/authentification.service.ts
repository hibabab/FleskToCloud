import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDto } from '../models/userDto';



@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {

  constructor(private http: HttpClient) {}
  readonly apiUrl = 'http://localhost:3000/auth';

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

  

}