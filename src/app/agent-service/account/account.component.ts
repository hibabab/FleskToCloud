import { Component, OnInit } from '@angular/core';
import { UserService } from '../../assure/services/user-service.service';
import { jwtDecode } from 'jwt-decode';
import { AgentServiceService } from '../Services/account.service';

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

interface AgentService {
  id: number;
  specialite: string;
  dateEmbauche: Date;
  user: User;
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
    gouvernat: string;
    pays: string;
  };
}

@Component({
  selector: 'app-account',
  standalone: false,
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
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

  agent: AgentService = {
    id: 0,
    specialite: '',
    dateEmbauche: new Date(),
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
      role: 'agent service'
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
    private agentService: AgentServiceService
  ) {}

  ngOnInit(): void {
    const token = this.getCookie('access_token');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userId = Number(decoded.sub);
      console.log('ID utilisateur extrait du token:', this.userId);
      this.loadAgentData(this.userId);
    } else {
      console.error('Token non trouvé');
      this.updateError = true;
      this.errorMessage = 'Authentification requise';
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop()?.split(';').shift() || null : null;
  }
  loadAgentData(userId: number): void {
    this.agentService.getAgentById(userId).subscribe({
      next: (response: AgentService) => {
        console.log('Réponse complète de l\'API:', response); // Ajoutez ce log
        this.agent = response;
        
        // Vérifiez si l'adresse existe
        const adresse = response.user.adresse || {
          rue: '',
          ville: '',
          codePostal: 0,
          gouvernat: '',
          pays: 'Tunisie'
        };
  
        this.userUpdate = {
          telephone: response.user.telephone,
          email: response.user.email,
          adresse: {
            rue: adresse.rue,
            ville: adresse.ville,
            codePostal: adresse.codePostal,
            gouvernat: adresse.gouvernat,
            pays: adresse.pays || 'Tunisie'
          }
        };
      },
      error: (err) => console.error('Erreur:', err)
    });
  }

  updateUser(): void {
    console.log('Données à envoyer pour mise à jour:', this.userUpdate);
    
    // Utiliser l'ID extrait du token directement
    this.userService.updateUser(this.userId, this.userUpdate)
      .subscribe({
        next: (response) => {
          console.log('Mise à jour réussie:', response);
          this.updateSuccess = true;
          this.updateError = false;
          // Recharger les données pour s'assurer qu'elles sont à jour
          this.loadAgentData(this.userId);
          
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

    // Utiliser l'ID extrait du token directement
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