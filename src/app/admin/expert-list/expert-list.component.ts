import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-expert-list',
  standalone: false,
  templateUrl: './expert-list.component.html',
  styleUrl: './expert-list.component.css'
})
export class ListExpertComponent implements OnInit {
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
