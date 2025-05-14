import { Component, OnInit } from '@angular/core';
import { ExpertconstatService } from '../service/expertconstat.service';
import { jwtDecode } from 'jwt-decode';
import { ConstatStatut } from '../enum/constatstatut';


@Component({
  selector: 'app-acceuil',
  standalone: false,
  templateUrl: './acceuil.component.html',
  styleUrl: './acceuil.component.css'
})
export class AcceuilComponent implements OnInit {
  counts = {
    enAttente: 0,
    programmes: 0,
    termines: 0
  };

  stats: any[] = [];
  expertId: number | null = null;
  currentTime: Date = new Date();
  totalStats: number = 0;

  constructor(private expertService: ExpertconstatService) {}

  ngOnInit(): void {
    this.getExpertId();
  }

  private getExpertId(): void {
    const token = this.getCookie('access_token');
    if (token) {
      const decoded: any = jwtDecode(token);
      const userId = Number(decoded.sub);
      
      this.expertService.getExpertIdByUserId(userId).subscribe({
        next: (expertId) => {
          this.expertId = expertId;
          this.loadConstats();
        },
        error: (err) => console.error(err)
      });
    }
  }

  private loadConstats(): void {
    if (!this.expertId) return;
  
    this.expertService.getConstatsByExpertId(this.expertId).subscribe({
      next: (constats: any[]) => {
        // Updated to use the enum values instead of hardcoded strings
        this.counts.enAttente = constats.filter(c => c.statut === ConstatStatut.AFFECTE).length;
        this.counts.programmes = constats.filter(c => c.statut === ConstatStatut.EN_COURS).length;
        this.counts.termines = constats.filter(c => c.statut === ConstatStatut.ESTIME || c.statut === ConstatStatut.CLOTURE).length;
        
        this.updateStats();
      },
      error: (err) => console.error(err)
    });
  }

  private updateStats(): void {
    // Calcul du total pour les pourcentages
    this.totalStats = this.counts.enAttente + this.counts.programmes + this.counts.termines;

    this.stats = [
      {
        label: 'En attente',
        value: this.counts.enAttente,
        icon: 'fas fa-hourglass-half',
        bgColor: 'bg-orange-500'
      },
      {
        label: 'Programmés',
        value: this.counts.programmes,
        icon: 'fas fa-calendar-check',
        bgColor: 'bg-blue-500'
      },
      {
        label: 'Terminés',
        value: this.counts.termines,
        icon: 'fas fa-check-circle',
        bgColor: 'bg-green-500'
      }
    ];
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
}