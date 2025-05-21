import { Component, OnInit } from '@angular/core';
import { ExpertconstatService } from '../service/expertconstat.service';
import { jwtDecode } from 'jwt-decode';
import { ConstatStatut } from '../enum/constatstatut';

@Component({
  selector: 'app-constat-en-cours',
  standalone:false,
  templateUrl: './constat-en-cours.component.html',
  styleUrls: ['./constat-en-cours.component.css']
})
export class ConstatEnCoursComponent implements OnInit {
  constatsEnCours: any[] = [];
  showModal = false;
  selectedConstat: any = null;
  
  selectedConstatId: number | null = null;
  showDetails = false;// Form Fields
  descriptionDommage = '';
  montantEstime: number | null = null;
  commentaire = '';
  fileToUpload: File | null = null;
   closeDetails(): void {
    this.showDetails = false;
    this.selectedConstatId = null;
  }
  
  // Validation
  formErrors = {
    description: false,
    montant: false,
    file: false
  };
  
  touchedFields = {
    description: false,
    montant: false,
    file: false
  };
  
  // Notifications
  notificationMessage = '';
  isSuccess = true;
  showNotification = false;
  
  // Loading State
  isLoading = false;
  
  // User Info
  userId: number | null = null;
  expertId: number | null = null;

  constructor(private expertconstatService: ExpertconstatService) {}

  ngOnInit(): void {
    this.decodeUserIdFromToken();
  }

  private decodeUserIdFromToken(): void {
    const token = this.getCookie('access_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.userId = Number(decoded.sub);
        this.getExpertId();
      } catch (error) {
        this.showErrorNotification('Erreur de décodage du token');
      }
    }
  }

  private getExpertId(): void {
    if (!this.userId) return;
    
    this.expertconstatService.getExpertIdByUserId(this.userId).subscribe({
      next: (expertId) => {
        this.expertId = expertId;
        this.loadConstatsEnCours();
      },
      error: (err) => {
        this.showErrorNotification('Erreur de récupération de l\'expert');
      }
    });
  }

  loadConstatsEnCours(): void {
    if (!this.expertId) return;
    
    this.expertconstatService.getConstatsByExpertId(this.expertId).subscribe({
      next: (data) => {
        this.constatsEnCours = data.filter((c: any) => 
          c.statut === ConstatStatut.EN_COURS
        );
      },
      error: (error) => {
        this.showErrorNotification('Erreur de chargement des constats');
      }
    });
  }

  openModal(constat: any): void {
    this.selectedConstat = constat;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.fileToUpload = file;
    this.formErrors.file = !file;
  }

  private resetForm(): void {
    this.descriptionDommage = '';
    this.montantEstime = null;
    this.commentaire = '';
    this.fileToUpload = null;
    this.formErrors = {
      description: false,
      montant: false,
      file: false
    };
    this.touchedFields = {
      description: false,
      montant: false,
      file: false
    };
  }

  validerEstimation(): void {
    // Mark all fields as touched
    this.touchedFields = {
      description: true,
      montant: true,
      file: true
    };

    // Validate form
    this.formErrors = {
      description: !this.descriptionDommage,
      montant: !this.montantEstime || this.montantEstime <= 0,
      file: !this.fileToUpload
    };

    if (Object.values(this.formErrors).some(error => error)) {
      this.showErrorNotification('Veuillez corriger les erreurs du formulaire');
      return;
    }

    this.isLoading = true;
    
    const formData = new FormData();
    formData.append('constatId', this.selectedConstat.idConstat.toString());
    formData.append('montant', this.montantEstime!.toString());
    formData.append('degats', this.descriptionDommage);
    formData.append('rapport', this.fileToUpload!, this.fileToUpload!.name);
    
    if (this.commentaire) {
      formData.append('commentaire', this.commentaire);
    }

    this.expertconstatService.estimerConstatParExpert(formData).subscribe({
      next: () => {
        this.showSuccessNotification('Estimation envoyée avec succès');
        this.closeModal();
        this.loadConstatsEnCours();
      },
      error: (err) => {
        this.showErrorNotification(err.error?.message || 'Erreur lors de l\'envoi');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Notification Helpers
  private showSuccessNotification(message: string): void {
    this.notificationMessage = message;
    this.isSuccess = true;
    this.showNotification = true;
    setTimeout(() => this.hideNotification(), 5000);
  }

  private showErrorNotification(message: string): void {
    this.notificationMessage = message;
    this.isSuccess = false;
    this.showNotification = true;
    setTimeout(() => this.hideNotification(), 5000);
  }

  hideNotification(): void {
    this.showNotification = false;
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
  // Méthodes pour gérer les détails
  viewDetails(constatId: number): void {
    this.selectedConstatId = constatId;
    this.showDetails = true;
  }

  hideConstatDetails(): void {
    this.showDetails = false;
    this.selectedConstatId = null;
  }
}