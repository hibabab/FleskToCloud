import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpertService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getExpertById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/expert/${id}`);
  }

  getExpertByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/expert/user/${userId}`);
  }
}