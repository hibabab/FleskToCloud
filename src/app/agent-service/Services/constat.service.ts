// Fix for constat.service.ts in Angular frontend
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConstatService {
  private constatsUrl: string = 'http://localhost:3000/constat';
  private expertsUrl: string = 'http://localhost:3000/expert';
  private apiUrl2 = 'http://localhost:3000/agent-service';

  constructor(private http: HttpClient) { }

  // Obtenir tous les constats avec logging
  getAllConstats(): Observable<any> {
    console.log('Appel API: getAllConstats');
    return this.http.get(`${this.constatsUrl}/get_all_constats`).pipe(
      tap(data => console.log('Réponse API getAllConstats:', data)),
      catchError(error => {
        console.error('Erreur lors de la récupération des constats:', error);
        throw error;
      })
    );
  }

  // Obtenir tous les experts
  getAllExperts(): Observable<any> {
    console.log('Appel API: getAllExperts');
    return this.http.get(this.expertsUrl).pipe(
      tap(data => console.log('Réponse API getAllExperts:', data)),
      catchError(error => {
        console.error('Erreur lors de la récupération des experts:', error);
        throw error;
      })
    );
  }

  // Méthode corrigée pour affecter un expert
  affecterExpert(
    expertId: number,
    constatId: number,
    agentId: number,
    commentaire: string
  ): Observable<any> {
    const body = {
      expertId,
      constatId,
      agentId,  // Sending the agentId directly now
      commentaire
    };
    console.log('Appel API: affecterExpert avec body:', body);
    return this.http.post(`${this.constatsUrl}/affecter-expert`, body).pipe(
      tap(data => console.log('Réponse API affecterExpert:', data)),
      catchError(error => {
        console.error('Erreur lors de l\'affectation de l\'expert:', error);
        throw error;
      })
    );
  }

  // Méthode pour obtenir l'ID de l'agent en fonction de l'ID utilisateur
  getAgentIdByUserId(userId: number): Observable<number> {
    console.log('Appel API: getAgentIdByUserId pour userId:', userId);
    return this.http.get<number>(`${this.apiUrl2}/agentIdByUserId/${userId}`).pipe(
      tap(data => console.log('Réponse API getAgentIdByUserId:', data)),
      catchError(error => {
        console.error('Erreur lors de la récupération de l\'ID agent:', error);
        throw error;
      })
    );
  }

  // Nouvelle méthode pour simplifier l'affectation d'expert avec userId
  affecterExpertAvecUserId(
    expertId: number, 
    constatId: number, 
    userId: number, 
    commentaire: string
  ): Observable<any> {
    // D'abord on obtient l'agentId à partir du userId
    return this.getAgentIdByUserId(userId).pipe(
      switchMap(agentId => {
        // Puis on appelle la méthode d'affectation avec l'agentId
        return this.affecterExpert(expertId, constatId, agentId, commentaire);
      })
    );
  }

  // Méthode améliorée pour estimer le montant des dommages
  estimerMontantParAgent(
    constatId: number,
    agentId: number,
    montant: number,
    degats?: string,
    commentaire?: string
  ): Observable<any> {
    const body = {
      constatId,
      agentId,
      montant,
      degats,
      commentaire
    };
    console.log('Appel API: estimerMontantParAgent avec body:', body);
    return this.http.post(`${this.constatsUrl}/estimer-montant-agent`, body).pipe(
      tap(data => console.log('Réponse API estimerMontantParAgent:', data)),
      catchError(error => {
        console.error('Erreur lors de l\'estimation du montant:', error);
        throw error;
      })
    );
  }
}