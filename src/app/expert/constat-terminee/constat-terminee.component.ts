import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { ExpertconstatService } from '../service/expertconstat.service';
import { ConstatStatut } from '../enum/constatstatut';


@Component({
  selector: 'app-constat-terminee',
  templateUrl: './constat-terminee.component.html',
  standalone: false,
  styleUrls: ['./constat-terminee.component.css']
})
export class ConstatTermineeComponent implements OnInit {
  userId: number | null = null;
  expertId: number | null = null;
  constatestime: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private expertconstatService: ExpertconstatService) {}

  ngOnInit(): void {
    this.decodeUserIdFromToken();
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  private decodeUserIdFromToken(): void {
    try {
      const token = this.getCookie('access_token');
      if (!token) {
        this.errorMessage = 'Token non trouvé';
        return;
      }

      const decoded: any = jwtDecode(token);
      this.userId = Number(decoded.sub);
      if (!this.userId) {
        this.errorMessage = 'ID utilisateur invalide dans le token';
        return;
      }
      this.getExpertIdAndLoadConstats();
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      this.errorMessage = 'Erreur d\'authentification';
    }
  }

  private getExpertIdAndLoadConstats(): void {
    if (!this.userId) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.expertconstatService.getExpertIdByUserId(this.userId).subscribe({
      next: (expertId) => {
        this.expertId = expertId;
        this.loadConstatsEstime();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'ID expert:', err);
        this.errorMessage = 'Erreur lors de la récupération de l\'ID expert';
        this.isLoading = false;
      }
    });
  }

  loadConstatsEstime(): void {
    if (!this.expertId) {
      this.errorMessage = 'ID expert non trouvé';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.expertconstatService.getConstatsByExpertId(this.expertId).subscribe({
      next: (data) => {
        // Updated to use the enum for ESTIME status
        this.constatestime = data.filter((constat: any) => constat.statut === ConstatStatut.ESTIME);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des constats:', error);
        this.errorMessage = 'Erreur lors du chargement des constats';
        this.isLoading = false;
      }
    });
  }
}