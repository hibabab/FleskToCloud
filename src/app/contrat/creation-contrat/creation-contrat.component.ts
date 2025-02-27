import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-creation-contrat',
  standalone: false, // Composant non standalone
  templateUrl: './creation-contrat.component.html',
  styleUrl: './creation-contrat.component.css'
})
export class CreationContratComponent {
  // Déclaration du formulaire réactif
  formulaireContrat: FormGroup;

  // Liste des packs disponibles
  packs: string[] = [
    'Tous les risques', 'Pack tier', 'Sécurité plus'
  ];
  constructor(private fb: FormBuilder) {
    // Initialisation du formulaire avec des contrôles et des validateurs
    this.formulaireContrat = this.fb.group({
      // Section "Vos Coordonnées"
      assure_nom: ['', Validators.required],
      assure_prenom: ['', Validators.required],
      assure_cin: ['', Validators.required],
      assure_adresse: ['', Validators.required],
      assure_code_postal: ['', Validators.required],
      assure_telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      assure_email: ['', [Validators.required, Validators.email]],

      // Section "Votre Véhicule"
      type: ['', Validators.required],
      marque: ['', Validators.required],
      model: ['', Validators.required],
      Imat: ['', Validators.required],
      energie: ['', Validators.required],
      nbPlace: ['', [Validators.required, Validators.min(1)]],
      usage: ['', Validators.required],
      DPMC: ['', Validators.required],
      cylindrée: ['', Validators.required],
      chargeUtil: ['', Validators.required],
      valeurNeuf: ['', [Validators.required, Validators.min(0)]],
      numChassis: ['', Validators.required],
      poidsVide: ['', Validators.required],

      // Section "Renseignement"
      packChoisi: ['', Validators.required],
      pay: ['', Validators.required]
    });
  }

  // Méthode pour soumettre le formulaire
  onSubmit() {
    if (this.formulaireContrat.valid) {
      console.log('Formulaire soumis avec succès !', this.formulaireContrat.value);
      // Ici, vous pouvez ajouter la logique pour envoyer les données à un serveur
    } else {
      console.error('Le formulaire est invalide. Veuillez vérifier les champs.');
      // Marquer tous les champs comme "touched" pour afficher les erreurs de validation
      this.formulaireContrat.markAllAsTouched();
    }
  }

  // Méthode pour réinitialiser le formulaire
  resetForm() {
    this.formulaireContrat.reset();
  }
}
