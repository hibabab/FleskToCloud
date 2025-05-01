import { Component, OnInit } from '@angular/core';
import { AbstractControl, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { NotificationService } from '../../agent-service/Services/notification.service';


@Component({
  selector: 'app-demande-souscription-vie',
  standalone: false,
  templateUrl: './demande-souscription-vie.component.html',
  styleUrl: './demande-souscription-vie.component.css'
})
export class DemandeSouscriptionVieComponent implements OnInit {
  currentStep = 2;
  cin: string = '';
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  minDate: string;
  maxDate: string;
  userData: any = {};

  assureInfo = {
    situationProfessionnelle: '',
    revenuMensuel: null
  };

  empruntInfo = {
    organismePreteur: '',
    montantPret: null,
    dateEffet: '',
    datePremierR: '',
    dateDernierR: '',
    tauxInteret: null,
    typeAmortissement: '',
    periodiciteAmortissement: ''
  };
// Après - modifiez pour:
garanties = {
  deces: true,   // Maintenant true par défaut
  invalidite: false
};


  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {
    const currentYear = new Date().getFullYear();
    this.minDate = `${currentYear}-01-01`;
    this.maxDate = `${currentYear}-12-31`;
  }

  ngOnInit(): void {
    this.loadUserDataFromToken();

  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  loadUserDataFromToken(): void {
    const token = this.getCookie('access_token');

    if (!token) {
      this.errorMessage = 'Session invalide. Veuillez vous reconnecter.';
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const userId = Number(decoded.sub);

      if (!userId) {
        this.errorMessage = 'Impossible de récupérer l\'ID utilisateur';
        return;
      }

      this.fetchUserData(userId);
    } catch (error) {
      this.errorMessage = 'Erreur de décodage du token';
      console.error('Erreur de décodage:', error);
    }
  }
 
  fetchUserData(userId: number): void {
    this.http.get<any>(`http://localhost:3000/auth/users/${userId}`).subscribe({
      next: (user) => {
        this.userData = user;
        this.cin = user.Cin;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la récupération des données utilisateur';
        console.error('Erreur:', err);
      }
    });
  }

  prepareFormData(): any {
    return {
      emprunt: this.empruntInfo,
      garanties: this.garanties,
      assure: {
        ...this.assureInfo,
        userId: this.userData.id,
        nom: this.userData.nom,
        prenom: this.userData.prenom,
        Cin: this.userData.Cin,
        dateNaissance: this.userData.date_naissance,
        telephone: this.userData.telephone,
        email: this.userData.email,
        adresse: this.userData.adresse,
        situationProfessionnelle: this.assureInfo.situationProfessionnelle,
        revenuMensuel: this.assureInfo.revenuMensuel
      }
    };
  }

  submitForm(): void {
    this.isSubmitting = true;
    const formData = this.prepareFormData();
    if (!this.validateDates()) {
      return;
    }
    // Notification structurée pour correspondre à l'affichage côté agent
    const userNotification = {
      userId: this.userData.id,
      message: `Nouvelle demande de contrat d'assurance vie par ${this.userData.prenom} ${this.userData.nom} (CIN: ${this.userData.Cin})`,
      type: 'vie_subscription_request',
      metadata: {
        demandeur: {
          nomComplet: `${this.userData.prenom} ${this.userData.nom}`,
          email: this.userData.email
        },
        assure: formData.assure,
        emprunt: formData.emprunt,
        garanties: formData.garanties,
        dateSoumission: new Date().toISOString(),
        // Ajout des champs spécifiques attendus côté agent
        assureVie: {
          situationProfessionnelle: formData.assure.situationProfessionnelle,
          revenuMensuel: formData.assure.revenuMensuel
        },
        empruntDetails: formData.emprunt // Alias pour compatibilité
      }
    };

    this.notificationService.createSubscriptionRequestVie(this.userData, formData).subscribe({
      next: (response) => {
        this.successMessage = 'Demande envoyée avec succès.';
        setTimeout(() => {
          this.router.navigate(['/dashboard-assure/interface']);
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        setTimeout(() => {
          this.router.navigate(['/dashboard-assure/interface']);
        }, 2000);
      }
    });
  }
  // Ajoutez ces méthodes à votre classe
validateDates(): boolean {
  if (!this.empruntInfo.dateEffet || !this.empruntInfo.datePremierR || !this.empruntInfo.dateDernierR) {
    return false;
  }

  const dateEffet = new Date(this.empruntInfo.dateEffet);
  const datePremierR = new Date(this.empruntInfo.datePremierR);
  const dateDernierR = new Date(this.empruntInfo.dateDernierR);

  // Vérifie que datePremierR >= dateEffet
  if (datePremierR < dateEffet) {
    this.errorMessage = "La date du premier remboursement doit être postérieure ou égale à la date d'effet";
    return false;
  }

  // Vérifie que dateDernierR > datePremierR
  if (dateDernierR <= datePremierR) {
    this.errorMessage = "La date du dernier remboursement doit être postérieure à la date du premier remboursement";
    return false;
  }

  this.errorMessage = '';
  return true;
}

onDateEffetChange(): void {
  // Réinitialiser les dates dépendantes quand la date d'effet change
  if (this.empruntInfo.dateEffet) {
    const dateEffet = new Date(this.empruntInfo.dateEffet);
    this.empruntInfo.datePremierR = '';
    this.empruntInfo.dateDernierR = '';
  }
}

onDatePremierRChange(): void {
  // Réinitialiser la date de dernier remboursement quand la date du premier remboursement change
  if (this.empruntInfo.datePremierR) {
    this.empruntInfo.dateDernierR = '';
  }
}
}
