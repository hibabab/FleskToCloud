import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Définir l'interface PasswordChange ici
interface PasswordChange {
  oldPassword: string;
  newPassword: string;
}

interface UpdateUserDto {
  telephone: string;
  email: string;
  adresse: {
    rue: string;
    ville: string;
    codePostal: number;
    gouvernat: string;
    numMaison?: number;
    pays: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl1 = 'http://localhost:3000/user-gateway';
  private apiUrl2 = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  // GET user by ID
  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl1}/profile/${id}`);
  }

  // Update user data
  updateUser(id: number, userData: UpdateUserDto): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put(
      `${this.apiUrl1}/${id}/update`, 
      userData, 
      { headers }
    );
  }

  // Change user password
  changePassword(id: number, data: PasswordChange): Observable<any> {
    return this.http.post(`${this.apiUrl2}/${id}/change-password`, data);
  }
}