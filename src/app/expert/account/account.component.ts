import { Component, OnInit } from '@angular/core';
import { UserService } from '../../assure/services/user-service.service';
import { jwtDecode } from 'jwt-decode';
import { ExpertService } from '../service/account.service';

interface Address {
  rue: string;
  ville: string;
  codePostal: number;
  gouvernat: string;
  pays: string;
}

interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  Cin: number;
  telephone: string;
  adresse: Address;
  date_naissance: Date;
  role: string;
}

interface Expert {
  id: number;
  disponibilite: boolean;
  nbAnneeExperience: number;
  specialite: string;
  dateInscri: string;
  user: User;
  constats?: any[];
}

interface PasswordChange {
  oldPassword: string;
  newPassword: string;
}

interface UserUpdate {
  telephone: string;
  email: string;
  adresse: Address;
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
  
  // Indicateur de chargement
  loading = true;

  expert: Expert = {
    id: 0,
    disponibilite: false,
    nbAnneeExperience: 0,
    specialite: '',
    dateInscri: '',
    user: {
      id: 0,
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
      date_naissance: new Date(),
      role: 'expert'
    }
  };

  userUpdate: UserUpdate = {
    telephone: '',
    email: '',
    adresse: {
      rue: '',
      ville: '',
      codePostal: 0,
      gouvernat: '',
      pays: 'Tunisie'
    }
  };

  constructor(
    private userService: UserService,
    private expertService: ExpertService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const token = this.getCookie('access_token');
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.userId = Number(decoded.sub);
        console.log('ID utilisateur extrait du token:', this.userId);
        this.loadExpertData(this.userId);
      } catch (error) {
        console.error('Erreur de décodage du token:', error);
        this.updateError = true;
        this.errorMessage = 'Erreur d\'authentification. Veuillez vous reconnecter.';
        this.loading = false;
      }
    } else {
      console.error('Aucun token trouvé');
      this.updateError = true;
      this.errorMessage = 'Vous n\'êtes pas connecté. Veuillez vous connecter.';
      this.loading = false;
    }
  }

  loadExpertData(userId: number): void {
    console.log('Chargement des données pour l\'utilisateur ID:', userId);
    
    this.expertService.getExpertById(userId).subscribe({
      next: (response: Expert) => {
        console.log('Données expert reçues:', response);
        
        if (response && response.user) {
          this.expert = response;
          
          const adresse = response.user.adresse || {
            rue: '',
            ville: '',
            codePostal: 0,
            gouvernat: '',
            pays: 'Tunisie'
          };

          this.userUpdate = {
            telephone: response.user.telephone || '',
            email: response.user.email || '',
            adresse: {
              rue: adresse.rue || '',
              ville: adresse.ville || '',
              codePostal: adresse.codePostal || 0,
              gouvernat: adresse.gouvernat || '',
              pays: adresse.pays || 'Tunisie'
            }
          };
        } else {
          console.error('Réponse invalide de l\'API:', response);
          this.updateError = true;
          this.errorMessage = 'Données utilisateur incomplètes ou invalides';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données expert:', err);
        this.updateError = true;
        this.errorMessage = 'Erreur lors du chargement de vos informations';
        this.loading = false;
      }
    });
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      console.log(`Cookie ${name} trouvé:`, cookieValue ? 'valeur présente' : 'valeur absente');
      return cookieValue || null;
    }
    console.log(`Cookie ${name} non trouvé`);
    return null;
  }

  updateUser(): void {
    console.log('Données à envoyer pour mise à jour:', this.userUpdate);

    this.userService.updateUser(this.userId, this.userUpdate).subscribe({
      next: (response) => {
        console.log('Mise à jour réussie:', response);
        this.updateSuccess = true;
        this.updateError = false;
        this.loadExpertData(this.userId);

        setTimeout(() => {
          this.updateSuccess = false;
        }, 5000);
      },
      error: (err) => {
        console.error('Erreur détaillée:', err);
        this.updateError = true;
        this.updateSuccess = false;
        this.errorMessage = err.error?.message || 'Erreur de serveur lors de la mise à jour';

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

    this.userService.changePassword(this.userId, this.passwordData).subscribe({
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

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }
}