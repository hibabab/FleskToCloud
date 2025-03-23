import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expert-form',
  standalone: false,
  templateUrl: './expert-form.component.html',
  styleUrls: ['./expert-form.component.css'],
})
export class ExpertFormComponent {
  expertForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
  ) {
    // Initialisation du formulaire dans le constructeur
    this.expertForm = this.fb.group({
      // Informations de l'utilisateur
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      cin: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateNaissance: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],
      confirmPassword: ['', Validators.required],

      // Adresse
      rue: ['', Validators.required],
      ville: ['', Validators.required],
      codePostal: ['', Validators.required],
      pays: ['', Validators.required],

      // Informations de l'expert
      dateDebutTravail: ['', Validators.required], // Date de début de travail
      specialite: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword?.setErrors(null);
      return null;
    }
  };

  // Calcule le nombre d'années d'expérience
  calculateNbAnneeExperience(dateDebutTravail: string): number {
    const currentDate = new Date();
    const startDate = new Date(dateDebutTravail);
    const diffInMilliseconds = currentDate.getTime() - startDate.getTime();
    const diffInYears = diffInMilliseconds / (1000 * 60 * 60 * 24 * 365.25); // Prend en compte les années bissextiles
    return Math.floor(diffInYears); // Arrondit à l'entier inférieur
  }

  onSubmit(): void {
    if (this.expertForm.invalid) {
      if (this.expertForm.hasError('passwordMismatch')) {
        window.alert('Veuillez vérifier la confirmation du mot de passe.');
      } else if (this.expertForm.get('password')?.errors?.['pattern']) {
        window.alert('Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.');
      }
      return;
    }

    // Données de l'utilisateur
    const userData = {
      nom: this.expertForm.value.nom,
      prenom: this.expertForm.value.prenom,
      Cin: this.expertForm.value.cin,
      telephone: this.expertForm.value.telephone,
      email: this.expertForm.value.email,
      date_naissance: this.expertForm.value.dateNaissance,
      password: this.expertForm.value.password,
      role:"expert",
      adresse: {
        rue: this.expertForm.value.rue,
        ville: this.expertForm.value.ville,
        codePostal: this.expertForm.value.codePostal,
        pays: this.expertForm.value.pays,
      },
    };

    // Créer d'abord l'utilisateur
    this.http.post('http://localhost:3000/auth/register', userData).subscribe(
      (userResponse: any) => {
        console.log('Utilisateur créé avec succès:', userResponse);

        // Données de l'expert
        const dateDebutTravail = this.expertForm.value.dateDebutTravail;
        const nbAnneeExperience = this.calculateNbAnneeExperience(dateDebutTravail);

        const expertData = {
          userId: userResponse.id, // ID de l'utilisateur créé
          disponibilite: true, // Par défaut, l'expert est disponible
          nbAnneeExperience: nbAnneeExperience,
          specialite: this.expertForm.value.specialite,
          dateInscri: this.expertForm.value.dateDebutTravail,
        };

        // Ensuite, créer l'expert
        this.http.post('http://localhost:3000/expert/addExpert', expertData).subscribe(
          (expertResponse: any) => {
            console.log('Expert créé avec succès:', expertResponse);
            this.router.navigate(['/admin/listExpert']); // Redirigez vers la liste des experts
          },
          (expertError) => {
            console.error('Erreur lors de la création de l\'expert:', expertError);
          },
        );
      },
      (userError) => {
        window.alert("verifier vos information ");
        console.error('Erreur lors de la création de l\'utilisateur:', userError);
      },
    );
  }
}
