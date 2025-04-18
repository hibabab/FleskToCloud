import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { NotificationService } from '../../agent-service/Services/notification.service';
import { AbstractControl } from '@angular/forms';


@Component({
  selector: 'app-creation-contrat',
  standalone: false,
  templateUrl: './creation-contrat.component.html',
  styleUrls: ['./creation-contrat.component.css'],
})
export class CreationContratComponent implements OnInit {
  insuranceForm: FormGroup;
  userData: any;
  isLoading = false;
  errorMessage = '';
  successMessage = '';


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private notificationService: NotificationService
  ) {
    this.insuranceForm = this.fb.group({
      assure: this.fb.group({
        bonusMalus: ['', [Validators.required, Validators.min(1)]],
      }),
      vehicule: this.fb.group({
        type: ['', Validators.required],
        marque: ['', Validators.required],
        model: ['', Validators.required],
        Imat: ['', [Validators.required, Validators.pattern(/^\d{4}TU\d{2,3}$/)]],
        energie: ['', Validators.required],
        nbPlace: ['', Validators.required],
        DPMC: ['', Validators.required],
        cylindree: ['', Validators.required],
        chargeUtil: [''],
        valeurNeuf: ['', Validators.required],
        numChassis: ['', Validators.required],
        poidsVide: ['', Validators.required],
        puissance: ['', Validators.required]
      }),
      contrat: this.fb.group({
        packChoisi: ['', Validators.required],
        typePaiement: ['', Validators.required],
        NatureContrat: ['', Validators.required]

      })
    });
  }

  ngOnInit(): void {
    this.loadUserDataFromToken();
  }
  getFormControls(): { name: string; control: AbstractControl }[] {
    const controls: { name: string; control: AbstractControl }[] = [];

    Object.keys(this.insuranceForm.controls).forEach(key => {
      const control = this.insuranceForm.get(key);
      if (control) {
        controls.push({
          name: key,
          control: control
        });
      }
    });

    return controls;
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
    this.isLoading = true;
    this.http.get<any>(`http://localhost:3000/auth/users/${userId}`).subscribe({
      next: (user) => {
        this.userData = user;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la récupération des données utilisateur';
        console.error('Erreur:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.insuranceForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = {
      ...this.insuranceForm.value,
      assure: {
        ...this.insuranceForm.value.assure,
        // Ajoutez les infos utilisateur récupérées depuis le token
        userId: this.userData.id,
        nom: this.userData.nom,
        prenom: this.userData.prenom,
        Cin: this.userData.Cin,
        dateNaissance: this.userData.dateNaissance,
        telephone: this.userData.telephone,
        email: this.userData.email,
        adresse: this.userData.adresse
      }
    };

    // Créer une demande de souscription qui notifiera les agents
    this.notificationService.createSubscriptionRequest(this.userData, formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Votre demande de contrat a été envoyée avec succès. Un agent va la traiter prochainement.';

        // Créer une notification pour l'utilisateur lui-même
        this.notificationService.createNotification(
          this.userData.id,
          'Votre demande de contrat d\'assurance a été soumise et est en attente de traitement.'
        ).subscribe();

        // Réinitialiser le formulaire
        this.insuranceForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de l\'envoi de la demande. Veuillez réessayer.';
        console.error('Erreur:', error);
      }
    });
  }



}
