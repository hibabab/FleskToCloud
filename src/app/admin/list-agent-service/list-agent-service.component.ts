import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-list-agent-service',
  standalone: false,
  templateUrl: './list-agent-service.component.html',
  styleUrl: './list-agent-service.component.css'
})
export class ListAgentServiceComponent {
  agentServices: any[] = []; // Liste des agents de service

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Récupérer la liste des agents de service depuis le backend
    this.http.get<any[]>('http://localhost:3000/agent-service').subscribe(
      (data) => {
        this.agentServices = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des agents de service:', error);
      },
    );
  }
}
