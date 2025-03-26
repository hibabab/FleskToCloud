import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-creation-contrat',
  standalone: false,
  templateUrl: './creation-contrat.component.html',
  styleUrl: './creation-contrat.component.css'
})
export class CreationContratComponent implements OnInit {
  currentStep = 1;
  Cin = '';
  cinError = '';
  insuranceForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.insuranceForm = this.fb.group({
      bonusMalus: ['1', Validators.required],
      vehicule: this.fb.group({
        type: ['Tourisme', Validators.required],
        marque: ['', Validators.required],
        model: ['', Validators.required],
        Imat: ['', [Validators.required, this.validateImmatriculation]],
        energie: ['', Validators.required],
        nbPlace: ['', [Validators.required, Validators.min(1)]],
        DPMC: ['', Validators.required],
        cylindree: ['', Validators.required],
        chargeUtil: [''],
        valeurNeuf: ['', [Validators.required, Validators.min(0)]],
        numChassis: ['', Validators.required],
        poidsVide: ['', [Validators.required, Validators.min(0)]],
        puissance: ['', [Validators.required, Validators.min(0)]]
      }),
      contrat: this.fb.group({
        packChoisi: ['Pack1', Validators.required],
        typePaiement: ['Annuel', Validators.required],
        NatureContrat: ['Renouvelable', Validators.required]
      })
    });
  }

  ngOnInit(): void {}

  validateImmatriculation(control: AbstractControl): {[key: string]: any} | null {
    const pattern = /^\d{4}TU\d{3}$/;
    if (control.value && !pattern.test(control.value)) {
      return { 'invalidImmatriculation': true };
    }
    return null;
  }

  verifyCin(): void {
    // Simulation de vérification CIN
    if (!this.Cin) {
      this.cinError = 'Le numéro CIN est requis';
      return;
    }

    if (this.Cin.length < 8) {
      this.cinError = 'Le numéro CIN doit contenir au moins 8 caractères';
      return;
    }

    // Si tout est OK, passer à l'étape suivante
    this.currentStep = 2;
    this.cinError = '';
  }

  previousStep(): void {
    this.currentStep = 1;
  }

  redirectToRegistration(): void {
    // Redirection vers la page d'inscription
    console.log('Redirection vers la page d\'inscription');
    // this.router.navigate(['/inscription']);
  }

  onSubmit(): void {
    if (this.insuranceForm.valid) {
      console.log('Formulaire soumis:', {
        cin: this.Cin,
        ...this.insuranceForm.value
      });
      // Envoyer les données au serveur
      alert('Votre demande de contrat a été enregistrée avec succès!');
    } else {
      this.markFormGroupTouched(this.insuranceForm);
      alert('Veuillez remplir tous les champs obligatoires correctement.');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
