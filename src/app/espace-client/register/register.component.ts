import { Component } from '@angular/core';
import { AuthentificationService } from '../services/authentification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone:false
})
export class RegisterComponent {

  // Déclaration des données de l'utilisateur
  user = {
    nom: "",
    prenom: "",
    Cin: "",
    telephone: "",
    email: "",
    password: "",
    adresse: {
      rue: "",
      ville: "",
      codePostal: "",
      pays: ""
    },
    date_naissance: new Date('1995-05-10'),
    role:'user'


  };
confirm_password: any;
confirmPassword: any;

  constructor(private authService: AuthentificationService) {}

  // Méthode pour inscrire l'utilisateur
  onSubmit() {
    
    this.authService.register(this.user).subscribe(
      (response) => {
        console.log('User registered:', response);
        // Ajouter une logique de redirection ou d'affichage d'un message de succès
      },
      (error) => {
        console.error('Error during registration:', error);
        alert('Erreur lors de l\'inscription');
      }
    );
  }
}
