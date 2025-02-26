import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-devi',
  standalone:false,
  templateUrl: './devi.component.html',
  styleUrls: ['./devi.component.css']
})
export class DeviComponent {
  etape: number = 1;

  // Formulaire réactif pour l'étape 1
  formulaireEtape1: FormGroup;

  // Formulaire réactif pour l'étape 2
  formulaireEtape2: FormGroup;

  // Formulaire réactif pour l'étape 3
  formulaireEtape3: FormGroup;

  // Liste des classes Bonus/Malus
  classesBonusMalus: string[] = [
    'Classe 1', 'Classe 2', 'Classe 3', 'Classe 4', 'Classe 5',
    'Classe 6', 'Classe 7', 'Classe 8', 'Classe 9', 'Classe 10', 'Classe 11'
  ];

  // Liste des packs
  packs: string[] = [
    'Tous les risques', 'Pack tier', 'Sécurité plus'
  ];

  constructor(private fb: FormBuilder) {
    // Initialisation des formulaires
    this.formulaireEtape1 = this.fb.group({
      typeVehicule: ['', Validators.required],
      valeurNeuf: ['', Validators.required],
      valeurActuelle: ['', Validators.required],
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      puissance: ['', Validators.required],
      anneeMiseCirculation: ['', Validators.required],
      immatriculation: ['', Validators.required]
    });

    this.formulaireEtape2 = this.fb.group({
      bonusMalus: ['', Validators.required],
      packChoisi: ['', Validators.required]
    });

    this.formulaireEtape3 = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      adresse: ['', Validators.required],
      codePostal: ['', Validators.required],
      age: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  suivant() {
    if (this.etape === 1 && this.formulaireEtape1.invalid) {
      this.formulaireEtape1.markAllAsTouched();
      return;
    }
    if (this.etape === 2 && this.formulaireEtape2.invalid) {
      this.formulaireEtape2.markAllAsTouched();
      return;
    }
    if (this.etape < 3) {
      this.etape++;
    }
  }

  precedent() {
    if (this.etape > 1) {
      this.etape--;
    }
  }

  soumettre() {
    if (this.formulaireEtape3.invalid) {
      this.formulaireEtape3.markAllAsTouched();
      return;
    }
    console.log('Formulaire soumis', this.formulaireEtape3.value);
  }
}
