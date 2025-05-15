import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { NotificationService } from '../../agent-service/Services/notification.service';
import { Router } from '@angular/router';
import { DocService } from '../services/doc-service.service';


@Component({
  selector: 'app-creation-contrat',
  standalone: false,
  templateUrl: './creation-contrat.component.html',
  styleUrls: ['./creation-contrat.component.css']
})
export class CreationContratComponent implements OnInit {
  insuranceForm: FormGroup;
  userData: any;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  loadingMessage = '';
  currentStep = 1;
  currentYear = new Date().getFullYear();
  minDate = new Date(1980, 0, 1).toISOString().split('T')[0];
  maxDate = new Date().toISOString().split('T')[0];

  // Variables pour la gestion de la carte grise
  selectedFile: File | null = null;
  analysisResults: any = null;
  displayAnalysisResults: any[] = [];

  puissanceOptions: number[] = [4, 5, 6, 7, 8, 9, 10, 11, 12];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService,
    private docService: DocService
  ) {
     this.insuranceForm = this.fb.group({
      assure: this.fb.group({
        bonusMalus: [null, [Validators.required, Validators.min(0), Validators.max(200)]]
      }),
      vehicule: this.fb.group({
        type: ['', Validators.required],
        marque: ['', Validators.required],
        model: ['', Validators.required],
        Imat: ['', [Validators.required,  this.validateImmatriculation]],
        energie: ['', Validators.required],
        nbPlace: [null, [Validators.required, Validators.min(2), Validators.max(9)]],
        DPMC: ['', [Validators.required, this.validateDate.bind(this)]],
        cylindree: [null, [
          Validators.required,
          Validators.min(800),
          Validators.max(3500)
        ]],
        chargeUtil: [null, [Validators.min(350), Validators.max(26000)]],
        valeurNeuf: [null, [
          Validators.required,
          Validators.min(8000),
          Validators.max(999999),
          Validators.pattern('^[0-9]*$')
        ]],
        numChassis: ['', [
          Validators.required,
          Validators.minLength(17),
          Validators.maxLength(17),
          this.validateChassisNumber.bind(this)
        ]],
        poidsVide: [null, [
          Validators.required,
          Validators.min(900),
          Validators.max(3000)
        ]],
        puissance: [null, [Validators.required, Validators.min(4), Validators.max(12)]]
      }),
      contrat: this.fb.group({
        packChoisi: ['', Validators.required],

      })
    });
  }

  ngOnInit(): void {
    this.loadUserDataFromToken();
  }

  // Gestion des étapes
  goToNextStep(): void {
    if (this.currentStep === 1 && this.analysisResults) {
      this.populateFormWithAnalysis();
      this.currentStep = 2;
    }
  }

  goToPreviousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Gestion de la carte grise
  onFileSelect(event: any): void {
    this.selectedFile = event.target.files[0];
    this.resetAnalysisState();
  }

  handleFileDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;

    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.resetAnalysisState();
    }
  }

  async processDocument(): Promise<void> {
    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier';
      return;
    }

    this.isLoading = true;
    this.loadingMessage = 'Analyse de la carte grise en cours...';
    this.errorMessage = '';

    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      const config = {
        country: 'tunisia',
        docType: 'Carte grise',
        detectFields: false
      };

      this.analysisResults = await this.docService.processDocument(
        formData,
        config.country,
        config.docType,
        config.detectFields
      ).toPromise();


    } catch (error) {
      this.errorMessage = 'Erreur lors de l\'analyse du document. Veuillez vérifier que le document est lisible.';
      console.error('Erreur détaillée:', error);
    } finally {
      this.isLoading = false;
      this.loadingMessage = '';
    }
  }



  private populateFormWithAnalysis(): void {
    if (!this.analysisResults) return;

    this.insuranceForm.patchValue({
      vehicule: {
        type: this.analysisResults.type || '',
        marque: this.analysisResults.marque || '',
        model: this.analysisResults.model || '',
        Imat: this.analysisResults.Imat || '',
        energie: this.analysisResults.energie || '',
        DPMC: this.analysisResults.DPMC || '',
        cylindree: this.analysisResults.cylindree || null,
        puissance: this.analysisResults.puissance || null
      }
    });
  }

  private resetAnalysisState(): void {
    this.errorMessage = '';
    this.analysisResults = null;
    this.displayAnalysisResults = [];
  }

  // Validation des champs
  validateImmatriculation(control: AbstractControl): {[key: string]: any} | null {
    const pattern = /^\d{1,4}TU\d{1,3}$/i;

    if (control.value && !pattern.test(control.value)) {
      return { 'invalidImmatriculation': true };
    }
    return null;
  }

  validateDate(control: AbstractControl): {[key: string]: boolean} | null {
    const selectedDate = new Date(control.value);
    const minDate = new Date(1980, 0, 1);
    const maxDate = new Date();

    if (!control.value) return null;

    if (selectedDate < minDate) {
      return { 'minDate': true };
    }

    if (selectedDate > maxDate) {
      return { 'maxDate': true };
    }

    return null;
  }

  validateChassisNumber(control: AbstractControl): {[key: string]: boolean} | null {
    const value = control.value?.toUpperCase();
    if (!value) return null;

    const forbiddenChars = /[IOQ]/;
    const validPattern = /^[A-HJ-NPR-Z0-9]{17}$/;

    if (forbiddenChars.test(value)) {
      return { 'forbiddenChars': true };
    }

    if (!validPattern.test(value)) {
      return { 'invalidFormat': true };
    }

    return null;
  }

  formatChassisNumber(event: any) {
    let value = event.target.value.toUpperCase();
    value = value.replace(/[^A-HJ-NPR-Z0-9]/g, '');
    event.target.value = value;
    this.insuranceForm.get('vehicule.numChassis')?.setValue(value);
  }

  // Gestion des données utilisateur
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

  // Préparation et soumission du formulaire
  prepareFormData(): any {
    const formValue = this.insuranceForm.value;

    return {
      ...formValue,
      assure: {
        ...formValue.assure,
        bonusMalus: Number(formValue.assure.bonusMalus),
        userId: this.userData.id,
        nom: this.userData.nom,
        prenom: this.userData.prenom,
        Cin: this.userData.Cin,
        dateNaissance: this.userData.dateNaissance,
        telephone: this.userData.telephone,
        email: this.userData.email,
        adresse: this.userData.adresse
      },
      vehicule: {
        ...formValue.vehicule,
        nbPlace: Number(formValue.vehicule.nbPlace),
        puissance: Number(formValue.vehicule.puissance),
        cylindree: Number(formValue.vehicule.cylindree),
        chargeUtil: formValue.vehicule.chargeUtil ? Number(formValue.vehicule.chargeUtil) : null,
        valeurNeuf: Number(formValue.vehicule.valeurNeuf),
        poidsVide: Number(formValue.vehicule.poidsVide),
      },

      carteGrise : {

        ...this.analysisResults,
        dateAnalyse: new Date().toISOString(),
        fichierOriginal: this.selectedFile?.name || 'inconnu',
        estAnalyseAutomatique: true
      }
    };
  }

  onSubmit(): void {
    if (this.insuranceForm.invalid) {
      this.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.prepareFormData();

    this.notificationService.createSubscriptionRequest(this.userData, formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Votre demande de contrat a été envoyée avec succès. Un agent va la traiter prochainement.';

        this.notificationService.createNotification(
          this.userData.id,
          'Votre demande de contrat d\'assurance a été soumise et est en attente de traitement.'
        ).subscribe({
          next: () => {
            setTimeout(() => {
              this.router.navigate(['/dashboard-assure/interface']);
            }, 2000);
          },
          error: (err) => {
            console.error('Erreur notification:', err);
            this.router.navigate(['/dashboard-assure/interface']);
          }
        });
        this.insuranceForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de l\'envoi de la demande. Veuillez réessayer.';
        console.error('Erreur:', error);
      }
    });
  }
 markAllAsTouched(): void {
    Object.values(this.insuranceForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
