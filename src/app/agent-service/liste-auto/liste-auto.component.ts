import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-liste-auto',
  standalone: false,
  templateUrl: './liste-auto.component.html',
  styleUrls: ['./liste-auto.component.css'],

})
export class ListeAutoComponent {
  assures: any[] = []; // Liste des assurés
  allAssures: any[] = []; // Copie de tous les assurés
  searchCin: string = '';
  searchMode: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllAssures();
  }

  loadAllAssures(): void {
    this.http.get<any>('http://localhost:3000/contrat-auto-geteway/assures').subscribe(
      (response) => {
        console.log('Données reçues:', response);

        if (response && response.success && Array.isArray(response.data)) {
          this.assures = response.data;
          this.allAssures = [...response.data]; // Sauvegarde une copie
        } else {
          console.error('Format de réponse inattendu ou erreur:', response);
          this.assures = [];
          this.allAssures = [];
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des assurés:', error);
      }
    );
  }

  searchAssure(): void {
    if (!this.searchCin) {
      this.resetSearch();
      return;
    }

    this.searchMode = true;

    // Option 1: Filtrage côté client
    this.assures = this.allAssures.filter(assure =>
      assure.Cin.toString().includes(this.searchCin)
    );

    // Option 2: Requête API (décommentez si vous préférez)
    /*
    this.http.get<any>(`http://localhost:3000/contrat-auto-geteway/assures/cin/${this.searchCin}`).subscribe(
      (response) => {
        if (response && response.success) {
          this.assures = Array.isArray(response.data) ? response.data : [response.data];
        } else {
          this.assures = [];
        }
      },
      (error) => {
        console.error('Erreur lors de la recherche:', error);
        this.assures = [];
      }
    );
    */
  }

  resetSearch(): void {
    this.searchCin = '';
    this.searchMode = false;
    this.assures = [...this.allAssures];
  }
}
