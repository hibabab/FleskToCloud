import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConstatService {

  private constatsUrl: string = 'http://localhost:3000/constat/get_all_constats';
  private expertsUrl: string = 'http://localhost:3000/expert';

  constructor(private http: HttpClient) { }

  // Obtenir tous les constats
  getAllConstats(): Observable<any> {
    return this.http.get(this.constatsUrl);
  }

  // Obtenir tous les experts
  getAllExperts(): Observable<any> {
    return this.http.get(this.expertsUrl);
  }
}
