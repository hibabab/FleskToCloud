import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgentServiceService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getAgentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/agent-service/${id}`);
  }

  getAgentByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/agent-service/user/${userId}`);
  }
}