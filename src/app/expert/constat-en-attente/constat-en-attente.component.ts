import { Component, OnInit } from '@angular/core';
import { ExpertconstatService } from '../service/expertconstat.service';
import { jwtDecode } from 'jwt-decode';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-constat-en-attente',
  standalone: false,
  templateUrl: './constat-en-attente.component.html',
  styleUrls: ['./constat-en-attente.component.css']
})
export class ConstatEnAttenteComponent implements OnInit {
  constatsEnAttente: any[] = [];
  showModal = false;
  selectedConstat: any = null;
  userId: number | null = null;
  expertId: number | null = null; // Nouvelle variable pour stocker l'ID expert

  constructor(private expertconstatService: ExpertconstatService) {}

  ngOnInit(): void {
    this.decodeUserIdFromToken();
  }

  private decodeUserIdFromToken(): void {
    const token = this.getCookie('access_token');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userId = Number(decoded.sub);
      this.getExpertIdAndLoadConstats(); // Appel de la nouvelle méthode
    } else {
      console.error('Token non trouvé');
    }
  }

  private getExpertIdAndLoadConstats(): void {
    if (!this.userId) return;

    this.expertconstatService.getExpertIdByUserId(this.userId).subscribe({
      next: (expertId) => {
        this.expertId = expertId;
        this.loadConstatsEnAttente(); // Charger les constats une fois l'ID expert obtenu
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'ID expert:', err);
      }
    });
  }

  loadConstatsEnAttente(): void {
    if (!this.expertId) { // Maintenant on utilise expertId au lieu de userId
      console.error('ID expert non trouvé');
      return;
    }
    
    this.expertconstatService.getConstatsByExpertId(this.expertId).subscribe({
      next: (data) => {
        this.constatsEnAttente = data.filter((constat: any) => constat.statut === 'En attente');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des constats :', error);
      }
    });
  }

  // Les autres méthodes restent inchangées
  openModal(constat: any) {
    this.selectedConstat = constat;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  programmerExpert() {
    if (
      this.selectedConstat?.date &&
      this.selectedConstat?.heure &&
      this.selectedConstat?.lieu
    ) {
      const data = {
        constatId: this.selectedConstat.idConstat,
        date: this.selectedConstat.date,
        heure: this.selectedConstat.heure,
        lieu: this.selectedConstat.lieu,
        commentaire: this.selectedConstat.commentaire || ''
      };
  
      this.expertconstatService.programmerExpertise(data).subscribe({
        next: (res) => {
          console.log('Expertise programmée avec succès :', res);
          alert('Expertise programmée avec succès !');
          this.closeModal();
          this.loadConstatsEnAttente(); // recharge la liste
        },
        error: (err) => {
          console.error('Erreur lors de la programmation de l\'expertise :', err);
          alert("Erreur lors de la programmation de l'expertise.");
        }
      });
    } else {
      alert('Veuillez remplir tous les champs requis.');
    }
  }
  

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
}
