import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '../../espace-client/models/userDto';
import { updateUserDto } from '../models/updateuserdto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl1 = `http://localhost:3000/user-gateway`; // NestJS API endpoint
  private apiUrl2 = `http://localhost:3000/auth`; // If needed for authentication

  constructor(private http: HttpClient) {}

  // GET user by ID
  getUserById(id: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl1}/profile/${id}`);
  }

  // Update user data
  updateUser(id: number, userData: updateUserDto): Observable<any> {
    return this.http.patch(`${this.apiUrl1}/users/${id}`, userData);
  }

  // Change user password (if needed)
  changePassword(data: { oldPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl2}/change-password`, data);
  }
}
