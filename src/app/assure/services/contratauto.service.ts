import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContratAutoService {
  private apiUrl = 'http://localhost:3000/contrat-auto-geteway'; 

  constructor(private http: HttpClient) {}

  // 1. GET tous les contrats auto
  getAllContrats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/CA`);
  }

  // 2. POST créer un contrat auto
  createContratAuto(data: {
    assure: any,
    Cin: number,
    vehicule: any,
    contrat: any
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/createCA`, data);
  }

  // 3. GET rechercher un contrat par CIN + Immat
  searchContrat(Cin: number, Imat: string): Observable<any> {
    const params = new HttpParams()
      .set('Cin', Cin)
      .set('Imat', Imat);
    return this.http.get(`${this.apiUrl}/search`, { params });
  }

  // 4. POST renouveler un contrat
  renouvelerContrat(data: {
    Cin: number,
    Imat: string,
    packChoice?: 'same' | 'Pack1' | 'Pack2' | 'Pack3'
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/renouveler-contrat`, data);
  }

  // 5. PATCH mise à jour des échéances
  updateEcheances(numContrat: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/update-echeances/${numContrat}`, {});
  }
}
