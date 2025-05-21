import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

export interface ImpactPoint {
  x: number;
  y: number;
  label: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  photo?: string;
}

@Component({
  selector: 'app-vehicule',
  standalone:false,
  templateUrl: './vehicule.component.html',
  styleUrls: ['./vehicule.component.css']
})
export class VehiculeComponent implements OnInit, OnDestroy {
  @Input() driverPrefix: string = 'A';
  @Output() formSubmitted = new EventEmitter<any>();
  
  vehiculeForm!: FormGroup;
  activeVehicle: string | null = null;
  private subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.setupFormListeners();
    this.vehiculeForm.valueChanges.subscribe(() => {
      if (this.vehiculeForm.valid) {
        this.formSubmitted.emit(this.vehiculeForm.value);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initForm(): void {
    this.vehiculeForm = this.fb.group({
      // Section Véhicule - Société d'Assurance
      vehiculeAssure: ['', Validators.required],
      agence: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      contratAssurance: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      
      // Section Assuré
      nomAssure: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\u00C0-\u017F\s'-]+$/)]],
      prenomAssure: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\u00C0-\u017F\s'-]+$/)]],
      isAssureConducteur: [true],
      numSocietaire: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      emailAssure: ['', [Validators.required, Validators.email]],
      telAssure: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      villeAssure: ['', Validators.required],
      rueAssure: ['', Validators.required],
      codePostalAssure: ['', [Validators.required, Validators.pattern(/^[0-9]{4}$/)]],
      
      // Section Conducteur
      nomConducteur: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\u00C0-\u017F\s'-]+$/)]],
      prenomConducteur: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\u00C0-\u017F\s'-]+$/)]],
      emailConducteur: ['', [Validators.required, Validators.email]],
      telConducteur: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      numPermis: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      dateDelivrance: ['', [Validators.required, this.pastDateValidator()]],
      villeConducteur: ['', Validators.required],
      rueConducteur: ['', Validators.required],
      codePostalConducteur: ['', [Validators.required, Validators.pattern(/^[0-9]{4}$/)]],
      
      // Section Identité du véhicule
      numImmatriculation: ['', [
        Validators.required, 
        this.tunisianLicenseValidator()
      ]],
      typeVehicule: ['', Validators.required],
      marqueVehicule: ['', Validators.required],
      modeleVehicule: ['', Validators.required],
      
      // Section Sens suivi
      venantDe: ['', Validators.required],
      allantA: ['', Validators.required],
      
      // Section Observations
      observation: ['', [Validators.minLength(20)]],
      degatsApparents: ['', [Validators.minLength(20)]],
    }, { 
      validators: [
        this.dateRangeValidator('dateDebut', 'dateFin'),
      ]
    });

    this.toggleConducteurFields(true);
  }

  // Validateur personnalisé pour les dates
  private dateRangeValidator(startControl: string, endControl: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const start = formGroup.get(startControl)?.value;
      const end = formGroup.get(endControl)?.value;
      return start && end && new Date(start) > new Date(end) 
        ? { dateRangeInvalid: true } 
        : null;
    };
  }

  // Validateur pour date de délivrance non future
  private pastDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const selectedDate = new Date(control.value);
      return selectedDate > new Date() ? { futureDate: true } : null;
    };
  }

  // Validateur pour format TU des plaques d'immatriculation (92TU4994)
  private tunisianLicenseValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const pattern = /^(\d{1,3})TU(\d{1,4})$/i;
      const isValid = pattern.test(control.value);
      
      return isValid ? null : { invalidFormat: true };
    };
  }
  
  private setupFormListeners(): void {
    // Écouteur pour le checkbox isAssureConducteur
    const conducteurSub = this.vehiculeForm.get('isAssureConducteur')?.valueChanges.subscribe(value => {
      this.toggleConducteurFields(value);
    });
    
    if (conducteurSub) {
      this.subscriptions.push(conducteurSub);
    }
    
    // Écouteur pour la date de début pour calculer automatiquement la date de fin (+1 an)
    const dateDebutSub = this.vehiculeForm.get('dateDebut')?.valueChanges.subscribe(dateDebut => {
      if (dateDebut) {
        const startDate = new Date(dateDebut);
        const endDate = new Date(startDate);
        endDate.setFullYear(startDate.getFullYear() + 1);
        
        // Formatage de la date en YYYY-MM-DD pour le champ input date
        const formattedDate = this.formatDateForInput(endDate);
        this.vehiculeForm.get('dateFin')?.setValue(formattedDate);
      }
    });
    
    if (dateDebutSub) {
      this.subscriptions.push(dateDebutSub);
    }
  }

  // Formatage de la date pour l'input HTML de type date (YYYY-MM-DD)
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toggleConducteurFields(isAssureConducteur: boolean): void {
    const conducteurFields = [
      'nomConducteur', 'prenomConducteur', 'emailConducteur', 'telConducteur', 
      'numPermis', 'dateDelivrance', 'villeConducteur', 'rueConducteur', 'codePostalConducteur'
    ];
    
    if (isAssureConducteur) {
      conducteurFields.forEach(field => {
        this.vehiculeForm.get(field)?.disable();
        this.vehiculeForm.get(field)?.clearValidators();
        this.vehiculeForm.get(field)?.updateValueAndValidity();
      });
    } else {
      conducteurFields.forEach(field => {
        this.vehiculeForm.get(field)?.enable();
        
        // Réappliquer les validateurs appropriés
        if (['nomConducteur', 'prenomConducteur', 'villeConducteur', 'rueConducteur'].includes(field)) {
          this.vehiculeForm.get(field)?.setValidators([Validators.required]);
        } else if (field === 'emailConducteur') {
          this.vehiculeForm.get(field)?.setValidators([Validators.required, Validators.email]);
        } else if (field === 'telConducteur') {
          this.vehiculeForm.get(field)?.setValidators([Validators.required, Validators.pattern(/^[0-9]{8}$/)]);
        } else if (field === 'numPermis') {
          this.vehiculeForm.get(field)?.setValidators([Validators.required, Validators.pattern(/^\d{10}$/)]);
        } else if (field === 'dateDelivrance') {
          this.vehiculeForm.get(field)?.setValidators([Validators.required, this.pastDateValidator()]);
        } else if (field === 'codePostalConducteur') {
          this.vehiculeForm.get(field)?.setValidators([Validators.required, Validators.pattern(/^[0-9]{4}$/)]);
        }
        
        this.vehiculeForm.get(field)?.updateValueAndValidity();
      });
    }
  }

  // Méthodes utilitaires pour les contrôles de formulaire
  hasError(controlName: string, errorType?: string): boolean {
    const control = this.vehiculeForm.get(controlName);
    if (errorType) {
      return control?.touched && control?.hasError(errorType) || false;
    }
    return control?.touched && control?.invalid || false;
  }

  getControlError(controlName: string): string {
    const control = this.vehiculeForm.get(controlName);
    if (!control?.touched || control?.valid) return '';
    
    if (control?.hasError('required')) return 'Ce champ est obligatoire';
    if (control?.hasError('email')) return 'Email invalide';
    if (control?.hasError('pattern')) {
      if (controlName === 'telAssure' || controlName === 'telConducteur') {
        return 'Numéro de téléphone invalide (8 chiffres requis)';
      }
      if (controlName === 'codePostalAssure' || controlName === 'codePostalConducteur') {
        return 'Code postal invalide (4 chiffres requis)';
      }
      if (controlName === 'numImmatriculation') {
        return 'Format invalide. Exemple: 92TU4994';
      }
      if (controlName === 'contratAssurance') {
        return 'Format invalide. 8 chiffres requis';
      }
      if (controlName === 'agence') {
        return 'Format invalide. Uniquement des chiffres';
      }
      if (controlName === 'numSocietaire') {
        return 'Format invalide. Uniquement des chiffres';
      }
      if (controlName === 'numPermis') {
        return 'Format invalide. 10 chiffres requis';
      }
      return 'Format invalide';
    }
    if (control?.hasError('minlength')) {
      return 'Minimum 20 caractères requis';
    }
    if (control?.hasError('futureDate')) {
      return 'La date ne peut pas être dans le futur';
    }
    if (control?.hasError('invalidFormat')) {
      return 'Format d\'immatriculation invalide. Exemple: 92TU4994';
    }
    
    return 'Champ invalide';
  }

  hasFormError(errorName: string): boolean {
    return this.vehiculeForm.hasError(errorName);
  }
}