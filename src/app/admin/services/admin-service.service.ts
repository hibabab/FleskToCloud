import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Admin {
  id?: number;
  nom: string;
  email: string;
  motDePasse: string;
  // Ajoutez les autres propriétés si besoin
}

export interface UpdateAdminDto {
  nom?: string;
  email?: string;
  // etc.
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = 'http://localhost:3000/admin-gateway';

  constructor(private http: HttpClient) {}

  createAdmin(adminData: Admin): Observable<any> {
    return this.http.post(`${this.baseUrl}/ajoutAdmin`, adminData);
  }

  updateAdmin(id: number, updateData: UpdateAdminDto): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, updateData);
  }

  verifyAdmin(email: string, motDePasse: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify`, { email, motDePasse });
  }

  changePassword(id: number, dto: ChangePasswordDto): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/change-password`, dto);
  }
}
