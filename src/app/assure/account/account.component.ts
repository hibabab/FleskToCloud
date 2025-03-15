import { Component, OnInit } from '@angular/core';
import { UserDto } from '../../espace-client/models/userDto';
import { updateUserDto } from '../models/updateuserdto';
import { UserService } from '../services/user-service.service';
import {jwtDecode} from 'jwt-decode'; // Assurez-vous d'avoir installé et importé jwt-decode

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  standalone: false
})
export class AccountComponent implements OnInit {

  isModalOpen = false; // Variable pour contrôler l'état du modal
  user: UserDto = {
    email: '',
    password: '',
    nom: '',
    prenom: '',
    Cin: '',
    telephone: '',
    adresse: {
      rue: '',
      ville: '',
      pays: '',
      codePostal: ''
    },
    date_naissance: new Date()
  };

  userUpdate: updateUserDto = {
    telephone: '',
    email: '',
    date_naissance: '',
    adresse: {
      rue: '',
      ville: '',
      codePostal: '',
      pays: ''
    }
  };

  constructor(private userService: UserService) {}

  // Fonction pour récupérer le cookie "access_token"
  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  ngOnInit(): void {
    // Récupérer le token depuis le cookie
    const token = this.getCookie('access_token');
    
    if (token) {
      const decoded: any = jwtDecode(token); // Décode le token
      const userId = Number(decoded.sub); // Convertir l'ID en nombre (Assurez-vous que `sub` est bien un nombre dans le token)
      this.loadUserData(userId); // Charger les données de l'utilisateur avec cet ID
    } else {
      console.error('Token JWT non trouvé');
      // Vous pouvez rediriger l'utilisateur vers la page de connexion, ou gérer l'erreur autrement
    }
  }

  // Charger les données de l'utilisateur
  loadUserData(id: number): void {
    this.userService.getUserById(id).subscribe(
      (user: UserDto) => {
        console.log('Données utilisateur chargées', user); // Log des données reçues
        this.user = user;

        // Vérification si date_naissance est un objet Date
        const dateNaissance = user.date_naissance instanceof Date ? user.date_naissance : new Date(user.date_naissance);

        this.userUpdate = {
          telephone: user.telephone,
          email: user.email,
          date_naissance: dateNaissance ? dateNaissance.toISOString().split('T')[0] : '', // Formater en yyyy-mm-dd
          adresse: {
            rue: user.adresse.rue,
            ville: user.adresse.ville,
            codePostal: user.adresse.codePostal,
            pays: user.adresse.pays
          }
        };

        console.log('Données utilisateur mises à jour', this.userUpdate); // Log après mise à jour
      },
      (error) => {
        console.error('Erreur lors du chargement des données de l\'utilisateur', error);
      }
    );
  }

  // Ouvrir le modal
  openModal(): void {
    this.isModalOpen = true;
  }

  // Fermer le modal
  closeModal(): void {
    this.isModalOpen = false;
  }

  // Mettre à jour les informations de l'utilisateur
  updateUser(): void {
    if (!this.userUpdate.email || !this.userUpdate.telephone || !this.userUpdate.date_naissance || 
        !this.userUpdate.adresse.rue || !this.userUpdate.adresse.ville || !this.userUpdate.adresse.codePostal || !this.userUpdate.adresse.pays) {
      alert('Tous les champs obligatoires doivent être remplis!');
      return;
    }

    const userId = 1; // Remplacez cela par l'ID réel de l'utilisateur
    this.userService.updateUser(userId, this.userUpdate).subscribe(
      (response) => {
        console.log('Utilisateur mis à jour avec succès', response);
        this.closeModal(); // Ferme le modal après la mise à jour
      },
      (error) => {
        console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
      }
    );
  }
}
