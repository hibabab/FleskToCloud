import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-liste-auto',
  standalone: false,
  templateUrl: './liste-auto.component.html',
  styleUrl: './liste-auto.component.css'
})
export class ListeAutoComponent {
  assures: any[] = []; // Liste des assurés

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Récupérer la liste des assurés depuis le backend
    this.http.get<any>('http://localhost:3000/contrat-auto-geteway/assures').subscribe(
      (response) => {
        console.log('Données reçues:', response);

        if (response && response.success && Array.isArray(response.data)) {
          this.assures = response.data;
        } else {
          console.error('Format de réponse inattendu ou erreur:', response);
          this.assures = [];
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des assurés:', error);
      },
    );}
}
