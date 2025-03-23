import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-agent-service-form',
  templateUrl: './agent-service-form.component.html',
  standalone: false,
  styleUrls: ['./agent-service-form.component.css']
})
export class AgentServiceFormComponent implements OnInit {
  agentServiceForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.agentServiceForm = this.fb.group({
      // Informations de l'utilisateur
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      cin: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateNaissance: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      // Adresse
      rue: ['', Validators.required],
      ville: ['', Validators.required],
      codePostal: ['', Validators.required],
      pays: ['', Validators.required],
      // Informations spécifiques à l'agent de service
      specialite: ['', Validators.required],
      dateEmbauche: ['', Validators.required]
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

  onSubmit(): void {
    if (this.agentServiceForm.invalid) {
      if (this.agentServiceForm.hasError('passwordMismatch')) {
        window.alert('Veuillez vérifier la confirmation du mot de passe.');
      } else if (this.agentServiceForm.get('password')?.errors?.['minlength']) {
        window.alert('Le mot de passe doit contenir au moins 8 caractères.');
      }
      return;
    }

    // Données de l'utilisateur
    const userData = {
      nom: this.agentServiceForm.value.nom,
      prenom: this.agentServiceForm.value.prenom,
      Cin: this.agentServiceForm.value.cin,
      telephone: this.agentServiceForm.value.telephone,
      email: this.agentServiceForm.value.email,
      date_naissance: this.agentServiceForm.value.dateNaissance,
      password: this.agentServiceForm.value.password,
      role:"agent service",
      adresse: {
        rue: this.agentServiceForm.value.rue,
        ville: this.agentServiceForm.value.ville,
        codePostal: this.agentServiceForm.value.codePostal,
        pays: this.agentServiceForm.value.pays,
      },
    };

    // Créer d'abord l'utilisateur
    this.http.post('http://localhost:3000/auth/register', userData).subscribe(
      (userResponse: any) => {
        console.log('Utilisateur créé avec succès:', userResponse);

        // Données de l'agent de service
        const agentServiceData = {
          userId: userResponse.id, // ID de l'utilisateur créé
          specialite: this.agentServiceForm.value.specialite,
          dateEmbauche: this.agentServiceForm.value.dateEmbauche,
        };

        // Ensuite, créer l'agent de service
        this.http.post('http://localhost:3000/agent-service/addAgentService', agentServiceData).subscribe(
          (agentServiceResponse: any) => {
            console.log('Agent de service créé avec succès:', agentServiceResponse);
            this.router.navigate(['/admin/listAgentService']); // Redirigez vers la liste des agents de service
          },
          (agentServiceError) => {
            console.error('Erreur lors de la création de l\'agent de service:', agentServiceError);
          },
        );
      },
      (userError) => {
        console.error('Erreur lors de la création de l\'utilisateur:', userError);
        window.alert("verifier vos information ");
      },
    );
  }
}
