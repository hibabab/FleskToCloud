// constat-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ConstatService } from '../services/constat.service';
import { jwtDecode } from 'jwt-decode';

export enum ConstatStatut {
  EN_ATTENTE = 'En attente',
  AFFECTE = 'Expert assigné',
  EN_COURS = 'Expertise en cours',
  ESTIME = 'ESTIMÉ',
  CLOTURE = 'Clôturé'
}

export interface Constat {
  idConstat: number;
  vehicule?: {
    Imat: string;
  };
  dateAccident: Date;
  heure: string;
  lieu?: {
    rue: string;
    numMaison?: number;
    ville: string;
    codePostal: number;
    pays: string;
  };
  statut: ConstatStatut;
  pathurl?: string;
  rapport?: {
    pathurl: string;
  };
  expert?: {
    user: {
      nom: string;
      prenom: string;
    };
    specialite: string;
  };
}

@Component({
  selector: 'app-constat-list',
  standalone:false,
  templateUrl: './constat-list.component.html',
  styleUrls: ['./constat-list.component.css']
})
export class ConstatListComponent implements OnInit {
  constats: Constat[] = [];
  filteredConstats: Constat[] = [];
  selectedStatus: ConstatStatut | 'Tous' = ConstatStatut.EN_ATTENTE;
  showFilters = false;

  statusFilters = [
    { key: 'Tous' as const, label: 'Tous les statuts' },
    { key: ConstatStatut.EN_ATTENTE, label: 'En attente' },
    { key: ConstatStatut.AFFECTE, label: 'Expert assigné' },
    { key: ConstatStatut.EN_COURS, label: 'Expertise en cours' },
    { key: ConstatStatut.ESTIME, label: 'Estimé' },
    { key: ConstatStatut.CLOTURE, label: 'Clôturé' }
  ];

  statusClasses: Record<ConstatStatut, string> = {
    [ConstatStatut.EN_ATTENTE]: 'bg-yellow-100 text-yellow-800',
    [ConstatStatut.AFFECTE]: 'bg-blue-100 text-blue-800',
    [ConstatStatut.EN_COURS]: 'bg-indigo-100 text-indigo-800',
    [ConstatStatut.ESTIME]: 'bg-green-100 text-green-800',
    [ConstatStatut.CLOTURE]: 'bg-gray-200 text-gray-700'
  };

  statusIcons: Record<ConstatStatut, string> = {
    [ConstatStatut.EN_ATTENTE]: 'fas fa-clock',
    [ConstatStatut.AFFECTE]: 'fas fa-user-check',
    [ConstatStatut.EN_COURS]: 'fas fa-search',
    [ConstatStatut.ESTIME]: 'fas fa-euro-sign',
    [ConstatStatut.CLOTURE]: 'fas fa-lock'
  };

  constructor(private constatService: ConstatService) {}

  ngOnInit(): void {
    this.fetchConstats();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  filterByStatus(status: ConstatStatut | 'Tous'): void {
    this.selectedStatus = status;
    this.filteredConstats = status === 'Tous' 
      ? [...this.constats] 
      : this.constats.filter(c => c.statut === status);
    
    this.sortConstats();
  }

  private sortConstats(): void {
    const statusOrder = [
      ConstatStatut.EN_ATTENTE,
      ConstatStatut.AFFECTE,
      ConstatStatut.EN_COURS,
      ConstatStatut.ESTIME,
      ConstatStatut.CLOTURE
    ];
    
    this.filteredConstats.sort((a, b) => 
      statusOrder.indexOf(a.statut) - statusOrder.indexOf(b.statut)
    );
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop()?.split(';').shift() || null : null;
  }

  private fetchConstats(): void {
    const token = this.getCookie('access_token');
    if (!token) return;

    try {
      const decoded = jwtDecode<{ sub: string }>(token);
      const userId = Number(decoded.sub);
      
      this.constatService.getConstatsByUser(userId).subscribe({
        next: (data) => {
          this.constats = data;
          this.filterByStatus(ConstatStatut.EN_ATTENTE);
        },
        error: (err) => console.error('Erreur de récupération:', err)
      });
    } catch (error) {
      console.error('Erreur de décodage du token:', error);
    }
  }
}