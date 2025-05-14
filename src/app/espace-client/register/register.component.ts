import { Component, OnInit } from '@angular/core';
import { AuthentificationService } from '../services/authentification.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UserDto } from '../models/userDto';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false
})
export class RegisterComponent implements OnInit {
  user: any = {
    email: '',
    password: '',
    nom: '',
    prenom: '',
    Cin: null as unknown as number, // ou 0 si préféré
    telephone: '',
    adresse: {
        rue: '',
        ville: '',
        codePostal: null as unknown as number, // ou 0
        pays: 'Tunisie',
        gouvernat: '',
        numMaison: undefined
    },
    date_naissance: new Date(),
    role: 'user',
};

  confirmPassword: string = "";
  errors = {
    email: "",
    cin: "",
    phone: "",
    password: "",
    age: "",
    general: "",
    address: "",
    codePostal: "",
    numMaison: ""
  };
  successMessage: string = "";
  isLoading: boolean = false;
  formSubmitted: boolean = false;

  constructor(
    private authService: AuthentificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generateCaptcha(); // Ajouter cette ligne
  }

  isAdult(birthDate: Date): boolean {
    if (!birthDate) return false;
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  }

  validateAge(): void {
    if (!this.user.date_naissance) {
      this.errors.age = "La date de naissance est requise";
      return;
    }
    
    if (!this.isAdult(new Date(this.user.date_naissance))) {
      this.errors.age = "Vous devez avoir au moins 18 ans pour vous inscrire";
    } else {
      this.errors.age = "";
    }
  }

  validatePassword(password: string): {valid: boolean, message?: string} {
    if (!password) return {valid: false, message: 'Le mot de passe est requis'};
    if (password.length < 8) return {valid: false, message: 'Minimum 8 caractères'};
    if (!/[A-Z]/.test(password)) return {valid: false, message: 'Au moins une majuscule'};
    if (!/[a-z]/.test(password)) return {valid: false, message: 'Au moins une minuscule'};
    if (!/\d/.test(password)) return {valid: false, message: 'Au moins un chiffre'};
    if (!/[@$!%*?&]/.test(password)) return {valid: false, message: 'Au moins un caractère spécial (@$!%*?&)'};
    return {valid: true};
  }

  validateConfirmPassword(): void {
    if (this.user.password !== this.confirmPassword) {
      this.errors.password = "Les mots de passe ne correspondent pas";
    } else {
      this.errors.password = "";
    }
  }

  validateAddress(): void {
    const addr = this.user.adresse;
    if (!addr.rue || !addr.ville || !addr.gouvernat || addr.codePostal === null || !addr.pays) {
      this.errors.address = "Tous les champs d'adresse sont requis sauf le numéro de maison";
    } else {
      this.errors.address = "";
    }
  }

  validateField(fieldName: string, value: any): void {
    switch(fieldName) {
      case 'password':
        const validation = this.validatePassword(value);
        this.errors.password = validation.valid ? '' : validation.message || '';
        break;
      case 'confirmPassword':
        this.validateConfirmPassword();
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          this.errors.email = "Format d'email invalide";
        } else {
          this.errors.email = "";
        }
        break;
      case 'telephone':
        if (value && !/^\d{8}$/.test(value.replace(/\s/g, ''))) {
          this.errors.phone = "Format de téléphone invalide (8 chiffres)";
        } else {
          this.errors.phone = "";
        }
        break;
      case 'cin':
        if (value === null || value === undefined) {
          this.errors.cin = "Le CIN est requis";
        } else if (isNaN(value)) {
          this.errors.cin = "Le CIN doit être un nombre";
        } else if (!/^\d{8}$/.test(value.toString())) {
          this.errors.cin = "Le CIN doit contenir exactement 8 chiffres";
        } else {
          this.errors.cin = "";
        }
        break;
      case 'codePostal':
        if (value === null || value === undefined) {
          this.errors.codePostal = "Le code postal est requis";
        } else if (isNaN(value)) {
          this.errors.codePostal = "Le code postal doit être un nombre";
        } else {
          this.errors.codePostal = "";
        }
        break;
      case 'numMaison':
        if (value && isNaN(value)) {
          this.errors.numMaison = "Le numéro de maison doit être un nombre";
        } else {
          this.errors.numMaison = "";
        }
        break;
      case 'address':
        this.validateAddress();
        break;
    }
  }

  isFormValid(form: NgForm): boolean {
    if (!form.valid) {
      return false;
    }
    
    for (const error of Object.values(this.errors)) {
      if (error) return false;
    }
    
    if (!this.isAdult(new Date(this.user.date_naissance))) {
      return false;
    }
    
    return true;
  }

  onSubmit(form: NgForm) {
    this.formSubmitted = true;
    this.resetErrors();
    
    // Validation des champs existants
    this.validateAllFields();
  
    // Validation CAPTCHA
    if (!this.isCaptchaValid()) {
      this.captchaError = 'Code de vérification incorrect';
      this.regenerateCaptcha();
      return;
    }
  
    // Validation acceptation des politiques
    if (!this.acceptPolicy) {
      this.errors.general = 'Vous devez accepter les politiques de confidentialité et conditions d\'utilisation';
      return;
    }
  
    // Vérification finale de la validité du formulaire
    if (!this.isFormValid(form)) {
      return;
    }
  
    this.isLoading = true;
  
    const userToSend = {
      ...this.user,
      Cin: Number(this.user.Cin),
      adresse: {
        ...this.user.adresse,
        numMaison: this.user.adresse.numMaison === null ? undefined : Number(this.user.adresse.numMaison),
        codePostal: Number(this.user.adresse.codePostal)
      }
    };
  
    this.authService.register(userToSend).subscribe({
      next: (response) => {
        this.handleSuccessResponse();
      },
      error: (error: HttpErrorResponse) => {
        this.handleErrorResponse(error);
      }
    });
  }

  private resetErrors(): void {
    this.errors = {
      email: "",
      cin: "",
      phone: "",
      password: "",
      age: "",
      general: "",
      address: "",
      codePostal: "",
      numMaison: ""
    };
    this.captchaError = ""; // Ajouté
    this.successMessage = "";
  }

  private validateAllFields(): void {
    this.validateAge();
    this.validateField('password', this.user.password);
    this.validateField('confirmPassword', this.confirmPassword);
    this.validateField('email', this.user.email);
    this.validateField('telephone', this.user.telephone);
    this.validateField('cin', this.user.Cin);
    this.validateField('codePostal', this.user.adresse.codePostal);
    this.validateField('numMaison', this.user.adresse.numMaison);
    this.validateField('address', null);
  }

  private handleSuccessResponse(): void {
    this.isLoading = false;
    this.successMessage = "Un code de vérification a été envoyé à votre email";
    this.router.navigate(['/espace-client/confirmemail'], {
      queryParams: { email: this.user.email }
    });
  }

  private handleErrorResponse(error: HttpErrorResponse): void {
    this.isLoading = false;
    this.resetErrors();
  
    const errorResponse = error.error;
    const errorMessage = errorResponse?.message || 'Une erreur inconnue est survenue';
    const errorField = errorResponse?.field?.toLowerCase() || 'general';
  
    // Using a type guard to check if errorField is a valid key
    if (errorField in this.errors) {
      // Type assertion to tell TypeScript this is a valid key
      (this.errors as Record<string, string>)[errorField] = errorMessage;
    } else {
      this.errors.general = errorMessage;
    }
  
    console.error('Erreur d\'inscription:', error);
  }
  gouvernorats: string[] = [
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa',
    'Jendouba', 'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia',
    'La Manouba', 'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid',
    'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
  ];
  villes: string[] = [];

  villesParGouvernorat: { [key: string]: string[] } = {
    'Ariana': ['Ariana Ville', 'La Soukra', 'Raoued', 'Kalaat el-Andalous'],
    'Béja': ['Béja', 'Nefza', 'Testour', 'Téboursouk', 'Amdoun'],
    'Ben Arous': ['Ben Arous', 'Ezzahra', 'Mégrine', 'Rades', 'Hammam Lif', 'Mohamedia'],
    'Bizerte': ['Bizerte', 'Menzel Bourguiba', 'Mateur', 'Tinja', 'Ghar El Melh'],
    'Gabès': ['Gabès', 'Mareth', 'El Hamma', 'Métouia', 'Ghannouch'],
    'Gafsa': ['Gafsa', 'Métlaoui', 'Redeyef', 'El Ksar', 'Moularès'],
    'Jendouba': ['Jendouba', 'Tabarka', 'Aïn Draham', 'Bou Salem', 'Fernana'],
    'Kairouan': ['Kairouan', 'Chebika', 'Sbikha', 'Haffouz', 'Nasrallah'],
    'Kasserine': ['Kasserine', 'Thala', 'Feriana', 'Sbeitla', 'Fériana'],
    'Kébili': ['Kébili', 'Douz', 'Souk Lahad', 'El Golâa', 'Jemna'],
    'Le Kef': ['Le Kef', 'Dahmani', 'Sakiet Sidi Youssef', 'Nebeur', 'Tajerouine'],
    'Mahdia': ['Mahdia', 'Chebba', 'Ksour Essef', 'El Jem', 'Sidi Alouane'],
    'La Manouba': ['La Manouba', 'Denden', 'Oued Ellil', 'Douar Hicher', 'Mornaguia'],
    'Médenine': ['Médenine', 'Djerba Midoun', 'Djerba Houmt Souk', 'Ben Guerdane', 'Zarzis'],
    'Monastir': ['Monastir', 'Sahline', 'Ksibet El Mediouni', 'Bembla', 'Bekalta'],
    'Nabeul': ['Nabeul', 'Takelsa', 'Grombalia', 'Slimane', 'Dar Chaabane', 'Korba'],
    'Sfax': ['Sfax Ville', 'Sakiet Ezzit', 'Sakiet Eddaïer', 'El Ain', 'Agareb', 'Mahres'],
    'Sidi Bouzid': ['Sidi Bouzid', 'Menzel Bouzaiane', 'Regueb', 'Jilma', 'Meknassy'],
    'Siliana': ['Siliana', 'Gaafour', 'Kesra', 'Bargou', 'El Krib'],
    'Sousse': ['Sousse', 'Hammam Sousse', 'Msaken', 'Kalâa Kebira', 'Akouda'],
    'Tataouine': ['Tataouine', 'Ghomrassen', 'Bir Lahmar', 'Remada', 'Dehiba'],
    'Tozeur': ['Tozeur', 'Nefta', 'Degache', 'Tameghza', 'Hezoua'],
    'Tunis': ['Tunis', 'Le Bardo', 'La Marsa', 'El Menzah', 'Carthage'],
    'Zaghouan': ['Zaghouan', 'El Fahs', 'Zriba', 'Bir Mcherga', 'Nadhour']
  };

 

  onGouvernoratChange(): void {
    const selectedGov = this.user.adresse.gouvernat;
    if (selectedGov && this.villesParGouvernorat.hasOwnProperty(selectedGov)) {
      this.villes = this.villesParGouvernorat[selectedGov];
    } else {
      this.villes = [];
    }
    this.user.adresse.ville = '';
  }
 // Variables supplémentaires
captchaCode: string = '';
captchaInput: string = '';
captchaError: string = '';
acceptPolicy: boolean = false;
showPolicyModal: boolean = false;
showTermsModal: boolean = false;

// Méthodes CAPTCHA
generateCaptcha(): void {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  this.captchaCode = '';
  for (let i = 0; i < 6; i++) {
    this.captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
}

isCaptchaValid(): boolean {
  return this.captchaInput.toUpperCase() === this.captchaCode;
}

regenerateCaptcha(): void {
  this.generateCaptcha();
  this.captchaInput = '';
}

// Gestion des modals
openPolicyModal(event: Event): void {
  event.preventDefault();
  this.showPolicyModal = true;
}

closePolicyModal(): void {
  this.showPolicyModal = false;
}

openTermsModal(event: Event): void {
  event.preventDefault();
  this.showTermsModal = true;
}

closeTermsModal(): void {
  this.showTermsModal = false;
}


}