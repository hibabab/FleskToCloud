import { Component } from '@angular/core';
import { AuthentificationService } from '../../espace-client/services/authentification.service';

@Component({
  selector: 'app-creation-compte',
  standalone: false,
  templateUrl: './creation-compte.component.html',
  styleUrl: './creation-compte.component.css'
})
export class CreationCompteComponent {
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
    date_naissance: new Date('1995-05-10')

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
