import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpertconstatService {
  private apiUrl = 'http://localhost:3000/expert'; // URL de ton API Gateway

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer les constats associés à un expert
  getConstatsByExpertId(expertId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${expertId}/constats`);
  }

  // Nouvelle méthode pour récupérer l'ID expert par user ID
  getExpertIdByUserId(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/user/${userId}/expert-id`);
  }
  // Programmer une expertise
programmerExpertise(data: {
  constatId: number;
  date: string;
  heure: string;
  lieu: string;
  commentaire?: string;
}): Observable<any> {
  return this.http.post('http://localhost:3000/constat/programmer-expertise', data);
}

}