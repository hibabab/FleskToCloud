import { Component, OnInit } from '@angular/core';
import { ExpertconstatService } from '../service/expertconstat.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-constat-en-cours',
  standalone: false,
  templateUrl: './constat-en-cours.component.html',
  styleUrls: ['./constat-en-cours.component.css']
})
export class ConstatEnCoursComponent implements OnInit {
  constatsEnCours: any[] = [];
  showModal = false;
  selectedConstat: any = null;
  montantEstime: number | null = null;

  expertId: number | null = null;
  userId: number | null = null;

  // Champs supplémentaires
  descriptionDommage: string = '';
  commentaire: string = '';
  fileToUpload: File | null = null;

  constructor(private expertconstatService: ExpertconstatService) {}

  ngOnInit(): void {
    this.decodeUserIdFromToken();
  }

  private decodeUserIdFromToken(): void {
    const token = this.getCookie('access_token');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userId = Number(decoded.sub);
      this.getExpertIdAndLoadConstats();
    } else {
      console.error('Token non trouvé');
    }
  }

  private getExpertIdAndLoadConstats(): void {
    if (!this.userId) return;

    this.expertconstatService.getExpertIdByUserId(this.userId).subscribe({
      next: (expertId) => {
        this.expertId = expertId;
        this.loadConstatsEnCours();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'ID expert:', err);
      }
    });
  }

  private loadConstatsEnCours(): void {
    if (!this.expertId) {
      console.error('ID expert non trouvé');
      return;
    }

    this.expertconstatService.getConstatsByExpertId(this.expertId).subscribe({
      next: (data) => {
        this.constatsEnCours = data.filter((constat: any) => constat.statut === 'En cours de traitement');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des constats :', error);
      }
    });
  }

  openModal(constat: any) {
    this.selectedConstat = constat;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedConstat = null;
    this.montantEstime = null;
    this.descriptionDommage = '';
    this.commentaire = '';
    this.fileToUpload = null;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileToUpload = file;
    }
  }



  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
 
  isLoading: boolean = false;
  
  validerEstimation(): void {
    // Add more detailed validation
    if (!this.selectedConstat || 
        !this.selectedConstat.idConstat || 
        !this.montantEstime || 
        !this.descriptionDommage || 
        !this.fileToUpload) {
      alert('Veuillez remplir tous les champs obligatoires et sélectionner un constat.');
      return;
    }
  
    this.isLoading = true;
  
    const formData = new FormData();
    formData.append('constatId', this.selectedConstat.idConstat.toString());
    formData.append('montant', this.montantEstime.toString());
    formData.append('degats', this.descriptionDommage);
  
    if (this.commentaire) {
      formData.append('commentaire', this.commentaire);
    }
  
    formData.append('rapport', this.fileToUpload, this.fileToUpload.name);
  
    this.expertconstatService.estimerConstatParExpert(formData).subscribe({
      next: () => {
        alert('Estimation envoyée avec succès.');
        this.closeModal();
        this.loadConstatsEnCours();
      },
      error: (err) => {
        console.error(err);
        alert('Une erreur est survenue lors de l\'envoi de l\'estimation.');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}  