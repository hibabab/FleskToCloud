import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConstatService {

  private constatsUrl: string = 'http://localhost:3000/constat';
  private expertsUrl: string = 'http://localhost:3000/expert';

  constructor(private http: HttpClient) { }

  // Obtenir tous les constats
  getAllConstats(): Observable<any> {
    return this.http.get(`${this.constatsUrl}/get_all_constats`);

  }

  // Obtenir tous les experts
  getAllExperts(): Observable<any> {
    return this.http.get(this.expertsUrl);
  }
  affecterExpert(
    expertId: number,
    constatId: number,
    agentId: number,
    commentaire: string
  ): Observable<any> {
    const body = {
      expertId,
      constatId,
      agentId,
      commentaire
    };
    return this.http.post(`${this.constatsUrl}/affecter-expert`, body);
  }
  private apiUrl2 = 'http://localhost:3000/agent-service'; // L'URL de l'API backend



  // Méthode pour obtenir l'ID de l'agent en fonction de l'ID utilisateur
  getAgentIdByUserId(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl2}/agentIdByUserId/${userId}`);
  }
  
}
