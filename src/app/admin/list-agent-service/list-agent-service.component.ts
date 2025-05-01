import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-agent-service',
  standalone: false,
  templateUrl: './list-agent-service.component.html',
  styleUrls: ['./list-agent-service.component.css']
})
export class ListAgentServiceComponent implements OnInit {
  agentServices: any[] = []; // Liste complète des agents
  filteredAgents: any[] = []; // Liste filtrée des agents
  selectedSpecialite: string = ''; // Spécialité sélectionnée

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllAgents();
  }

  loadAllAgents(): void {
    this.http.get<any[]>('http://localhost:3000/agent-service').subscribe(
      (data) => {
        this.agentServices = data;
        this.filteredAgents = [...this.agentServices];
      },
      (error) => {
        console.error('Erreur lors de la récupération des agents de service:', error);
      }
    );
  }

  filterAgentsBySpecialite(): void {
    if (!this.selectedSpecialite) {
      this.filteredAgents = [...this.agentServices];
    } else {
      this.http.get<any[]>(`http://localhost:3000/agent-service/specialite/${this.selectedSpecialite}`).subscribe(
        (data) => {
          this.filteredAgents = data;
        },
        (error) => {
          console.error(`Erreur lors de la récupération des agents avec la spécialité ${this.selectedSpecialite}:`, error);
          this.filteredAgents = [];
        }
      );
    }
  }

  getSpecialiteLabel(value: string): string {
    const specialites = [
      { value: 'service_client', label: 'Service Client / Accueil' },
      { value: 'gestion_contrats', label: 'Service Gestion des Contrats' },
      { value: 'service_sinistres', label: 'Service Sinistres' },
      { value: 'comptabilite_facturation', label: 'Service Comptabilité / Facturation' },
      { value: 'contentieux_recouvrement', label: 'Service Contentieux / Recouvrement' }
    ];

    const found = specialites.find(item => item.value === value);
    return found ? found.label : value;
  }
}
