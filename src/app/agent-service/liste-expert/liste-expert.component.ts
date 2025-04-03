import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-liste-expert',
  standalone: false,
  templateUrl: './liste-expert.component.html',
  styleUrl: './liste-expert.component.css'
})
export class ListeExpertComponent {
experts: any[] = []; // Liste des experts

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Récupérer la liste des experts depuis le backend
    this.http.get<any[]>('http://localhost:3000/expert').subscribe(
      (data) => {
        this.experts = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des experts:', error);
      },
    );
  }
}
