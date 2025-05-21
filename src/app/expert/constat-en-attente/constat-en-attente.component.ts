import { Component, OnInit } from '@angular/core';
import { ExpertconstatService } from '../service/expertconstat.service';
import { jwtDecode } from 'jwt-decode';
import { FormsModule } from '@angular/forms';
import { ConstatStatut } from '../enum/constatstatut';

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
  expertId: number | null = null;
  
  // Form validation
  formErrors = {
    date: false,
    heure: false,
    lieu: false
  };
  
  // Track which fields have been touched
  touchedFields = {
    date: false,
    heure: false,
    lieu: false
  };
  
  // Notification messages
  notificationMessage = '';
  isSuccess = true;
  showNotification = false;

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
      this.showErrorNotification('Erreur d\'authentification. Veuillez vous reconnecter.');
    }
  }

  private getExpertIdAndLoadConstats(): void {
    if (!this.userId) return;

    this.expertconstatService.getExpertIdByUserId(this.userId).subscribe({
      next: (expertId) => {
        this.expertId = expertId;
        console.log('expertid', expertId);
        this.loadConstatsEnAttente();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'ID expert:', err);
        this.showErrorNotification('Impossible de récupérer vos informations d\'expert.');
      }
    });
  }

  loadConstatsEnAttente(): void {
    if (!this.expertId) {
      console.error('ID expert non trouvé');
      return;
    }
    
    this.expertconstatService.getConstatsByExpertId(this.expertId).subscribe({
      next: (data) => {
        // Filter for constats with status 'Expert assigné' (AFFECTE)
        this.constatsEnAttente = data.filter((constat: any) => constat.statut === ConstatStatut.AFFECTE);
        console.log('Constats en attente de l\'expert :', this.constatsEnAttente);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des constats :', error);
        this.showErrorNotification('Erreur lors du chargement des constats.');
      }
    });
  }
  
  openModal(constat: any) {
    this.selectedConstat = {...constat};
    this.resetFormErrors();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedConstat = null;
    this.resetFormErrors();
  }
  
  resetFormErrors() {
    this.formErrors = {
      date: false,
      heure: false,
      lieu: false
    };
    
    this.touchedFields = {
      date: false,
      heure: false,
      lieu: false
    };
  }

  validateForm(): boolean {
    let isValid = true;
    
    // Mark all fields as touched during form submission
    this.touchedFields = {
      date: true,
      heure: true,
      lieu: true
    };
    
    // Validate all fields
    this.validateField('date');
    this.validateField('heure');
    this.validateField('lieu');
    
    if (this.formErrors.date || this.formErrors.heure || this.formErrors.lieu) {
      isValid = false;
    }
    
    return isValid;
  }
  
  // Validate a specific field
  validateField(fieldName: 'date' | 'heure' | 'lieu'): void {
    switch(fieldName) {
      case 'date':
        this.formErrors.date = !this.selectedConstat?.date;
        break;
      case 'heure':
        this.formErrors.heure = !this.selectedConstat?.heure;
        break;
      case 'lieu':
        this.formErrors.lieu = !this.selectedConstat?.lieu || this.selectedConstat.lieu.trim() === '';
        break;
    }
  }
  
  // Called when a field loses focus
  onFieldBlur(fieldName: 'date' | 'heure' | 'lieu'): void {
    this.touchedFields[fieldName] = true;
    this.validateField(fieldName);
  }

  programmerExpert() {
    if (!this.validateForm()) {
      return;
    }
    
    const data = {
      constatId: this.selectedConstat.idConstat,
      date: this.selectedConstat.date,
      heure: this.selectedConstat.heure,
      lieu: this.selectedConstat.lieu.trim(),
      commentaire: this.selectedConstat.commentaire?.trim() || ''
    };
      
    this.expertconstatService.programmerExpertise(data).subscribe({
      next: (res) => {
        console.log('Expertise programmée avec succès :', res);
        this.showSuccessNotification('Expertise programmée avec succès !');
        this.closeModal();
        this.loadConstatsEnAttente(); // recharge la liste
      },
      error: (err) => {
        console.error('Erreur lors de la programmation de l\'expertise :', err);
        this.showErrorNotification("Erreur lors de la programmation de l'expertise.");
      }
    });
  }
  
  showSuccessNotification(message: string) {
    this.notificationMessage = message;
    this.isSuccess = true;
    this.showNotification = true;
    setTimeout(() => this.showNotification = false, 5000); // Hide after 5 seconds
  }
  
  showErrorNotification(message: string) {
    this.notificationMessage = message;
    this.isSuccess = false;
    this.showNotification = true;
    setTimeout(() => this.showNotification = false, 5000); // Hide after 5 seconds
  }
  
  hideNotification() {
    this.showNotification = false;
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }
  selectedConstatId: number | null = null;
  showDetails = false;// Form Fields
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