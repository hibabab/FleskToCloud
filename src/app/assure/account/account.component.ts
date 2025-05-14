import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user-service.service';
import { jwtDecode } from 'jwt-decode';

interface Address {
  rue: string;
  ville: string;
  codePostal: number;
  gouvernat: string;  // Noter l'orthographe ici
  numMaison?: number;
  pays: string;
}

interface User {
  email: string;
  nom: string;
  prenom: string;
  Cin: number;
  telephone: string;
  adresse: Address;
  date_naissance: Date;
}

interface PasswordChange {
  oldPassword: string;
  newPassword: string;
}

interface UserUpdate {
  telephone: string;
  email: string;
  adresse: {
    rue: string;
    ville: string;
    codePostal: number;
    gouvernat: string;  // Noter l'orthographe ici aussi
    numMaison?: number;
    pays: string;
  };
}

@Component({
  selector: 'app-account',
  standalone: false,
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  isModalOpen = false;
  userId!: number;
  passwordData: PasswordChange = { oldPassword: '', newPassword: '' };
  confirmPassword = '';
  
  // Messages de notification
  updateSuccess = false;
  updateError = false;
  errorMessage = '';

  user: User = {
    email: '',
    nom: '',
    prenom: '',
    Cin: 0,
    telephone: '',
    adresse: {
      rue: '',
      ville: '',
      codePostal: 0,
      gouvernat: '',
      pays: 'Tunisie'
    },
    date_naissance: new Date()
  };

  userUpdate: UserUpdate = {
    telephone: '',
    email: '',
    adresse: {
      rue: '',
      ville: '',
      codePostal: 0,
      gouvernat: '',
      pays: 'Tunisie',
      numMaison: undefined
    }
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const token = this.getCookie('access_token');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userId = Number(decoded.sub);
      this.loadUserData(this.userId);
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop()?.split(';').shift() || null : null;
  }

  loadUserData(id: number): void {
    this.userService.getUserById(id).subscribe({
      next: (response: User) => {
        this.user = response;
        
        // Assignation explicite de chaque propriété pour éviter les problèmes d'orthographe
        this.userUpdate = {
          telephone: response.telephone,
          email: response.email,
          adresse: {
            rue: response.adresse.rue,
            ville: response.adresse.ville,
            codePostal: response.adresse.codePostal,
            gouvernat: response.adresse.gouvernat, // S'assurer que cette propriété est correcte
            numMaison: response.adresse.numMaison, // S'assurer que numMaison est bien récupéré
            pays: 'Tunisie'
          }
        };
        
        // Debug pour vérifier les valeurs reçues
        console.log('Données utilisateur chargées:', response);
        console.log('userUpdate initialisé:', this.userUpdate);
      },
      error: (err) => console.error('Erreur de chargement:', err)
    });
  }

  updateUser(): void {
    // Log pour vérifier les données avant envoi
    console.log('Données à envoyer pour mise à jour:', this.userUpdate);
    
    // S'assurer que tous les champs sont présents et bien formatés
    const updateData: UserUpdate = {
      telephone: this.userUpdate.telephone,
      email: this.userUpdate.email,
      adresse: {
        rue: this.userUpdate.adresse.rue,
        ville: this.userUpdate.adresse.ville,
        codePostal: this.userUpdate.adresse.codePostal,
        gouvernat: this.userUpdate.adresse.gouvernat,
        numMaison: this.userUpdate.adresse.numMaison,
        pays: 'Tunisie' // Toujours définir le pays comme 'Tunisie'
      }
    };

    this.userService.updateUser(this.userId, updateData)
      .subscribe({
        next: (response) => {
          console.log('Mise à jour réussie:', response);
          this.updateSuccess = true;
          this.updateError = false;
          // Recharger les données pour s'assurer qu'elles sont à jour
          this.loadUserData(this.userId);
          
          // Masquer le message de succès après 5 secondes
          setTimeout(() => {
            this.updateSuccess = false;
          }, 5000);
        },
        error: (err) => {
          console.error('Erreur détaillée:', err);
          this.updateError = true;
          this.updateSuccess = false;
          this.errorMessage = err.error?.message || 'Erreur de serveur lors de la mise à jour';
          
          // Masquer le message d'erreur après 5 secondes
          setTimeout(() => {
            this.updateError = false;
          }, 5000);
        }
      });
  }
  
  changePassword(): void {
    if (this.passwordData.newPassword !== this.confirmPassword) {
      this.updateError = true;
      this.errorMessage = 'Les mots de passe ne correspondent pas !';
      setTimeout(() => {
        this.updateError = false;
      }, 5000);
      return;
    }

    this.userService.changePassword(this.userId, this.passwordData)
      .subscribe({
        next: () => {
          this.updateSuccess = true;
          this.isModalOpen = false;
          this.passwordData = { oldPassword: '', newPassword: '' };
          this.confirmPassword = '';
          
          setTimeout(() => {
            this.updateSuccess = false;
          }, 5000);
        },
        error: (err) => {
          this.updateError = true;
          this.errorMessage = err.error?.message || 'Erreur lors du changement de mot de passe';
          
          setTimeout(() => {
            this.updateError = false;
          }, 5000);
        }
      });
  }

  openModal(): void { this.isModalOpen = true; }
  closeModal(): void { this.isModalOpen = false; }
}