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
  gouvernorats: string[] = [
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès',
    'Gafsa', 'Jendouba', 'Kairouan', 'Kasserine', 'Kébili',
    'Kef', 'Mahdia', 'Manouba', 'Médenine', 'Monastir',
    'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse',
    'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
  ];

  villes: string[] = [];
  villesParGouvernorat: { [key: string]: string[] } = {
    'Ariana': ['Ariana Ville', 'Ettadhamen', 'Mnihla', 'Raoued', 'Sidi Thabet', 'Soukra', 'Kalâat el-Andalous'],
    'Béja': ['Béja Ville', 'Amdoun', 'Goubellat', 'Medjez el-Bab', 'Nefza', 'Teboursouk', 'Testour', 'Thibar'],
    'Ben Arous': ['Ben Arous Ville', 'Bou Mhel el-Bassatine', 'El Mourouj', 'Ezzahra', 'Fouchana', 'Hammam Lif', 'Hammam Chott', 'Mohamedia', 'Mornag', 'Radès'],
    'Bizerte': ['Bizerte Ville', 'El Alia', 'Ghar El Melh', 'Mateur', 'Menzel Bourguiba', 'Menzel Jemil', 'Ras Jebel', 'Sejnane', 'Tinja', 'Utique', 'Zarzouna'],
    'Gabès': ['Gabès Ville', 'El Hamma', 'Ghannouch', 'Mareth', 'Matmata', 'Menzel Habib', 'Métouia', 'Nouvelle Matmata'],
    'Gafsa': ['Gafsa Ville', 'El Guettar', 'El Ksar', 'Mdhilla', 'Métlaoui', 'Moularès', 'Redeyef', 'Sened'],
    'Jendouba': ['Jendouba Ville', 'Aïn Draham', 'Balta-Bou Aouane', 'Bou Salem', 'Fernana', 'Ghardimaou', 'Oued Meliz', 'Tabarka'],
    'Kairouan': ['Kairouan Ville', 'Alaâ', 'Bou Hajla', 'Chebika', 'Echrarda', 'Haffouz', 'Hajeb El Ayoun', 'Nasrallah', 'Oueslatia', 'Sbikha'],
    'Kasserine': ['Kasserine Ville', 'Fériana', 'Foussana', 'Haïdra', 'Jedelienne', 'Majel Bel Abbès', 'Sbiba', 'Thala'],
    'Kébili': ['Kébili Ville', 'Douz', 'Faouar', 'Souk El Ahad'],
    'Kef': ['Le Kef Ville', 'Dahmani', 'Jérissa', 'El Ksour', 'Kalâat Khasba', 'Kalâat Senan', 'Nebeur', 'Sakiet Sidi Youssef', 'Tajerouine'],
    'Mahdia': ['Mahdia Ville', 'Bou Merdes', 'Chebba', 'El Jem', 'Essouassi', 'Hbira', 'Ksour Essef', 'Melloulèche', 'Ouled Chamekh', 'Rejiche', 'Sidi Alouane'],
    'Manouba': ['Manouba Ville', 'Borj El Amri', 'Den Den', 'Douar Hicher', 'El Battan', 'Mornaguia', 'Oued Ellil', 'Tebourba'],
    'Médenine': ['Médenine Ville', 'Ben Gardane', 'Beni Khedache', 'Djerba - Ajim', 'Djerba - Houmt Souk', 'Djerba - Midoun', 'Zarzis', 'Sidi Makhlouf'],
    'Monastir': ['Monastir Ville', 'Bekalta', 'Bembla', 'Beni Hassen', 'Jemmal', 'Ksar Hellal', 'Ksibet el-Médiouni', 'Moknine', 'Ouerdanin', 'Sahline', 'Sayada', 'Téboulba'],
    'Nabeul': ['Nabeul Ville', 'Béni Khalled', 'Béni Khiar', 'Bou Argoub', 'Dar Chaâbane', 'El Haouaria', 'El Mida', 'Grombalia', 'Hammamet', 'Kélibia', 'Korba', 'Menzel Bouzelfa', 'Menzel Temime', 'Soliman', 'Takelsa'],
    'Sfax': ['Sfax Ville', 'Agareb', 'Bir Ali Ben Khalifa', 'El Amra', 'El Hencha', 'Graïba', 'Jebiniana', 'Kerkennah', 'Mahrès', 'Menzel Chaker', 'Sakiet Eddaïer', 'Sakiet Ezzit', 'Skhira', 'Thyna'],
    'Sidi Bouzid': ['Sidi Bouzid Ville', 'Bir El Hafey', 'Cebbala Ouled Asker', 'Jilma', 'Meknassy', 'Menzel Bouzaiane', 'Mezzouna', 'Ouled Haffouz', 'Regueb', 'Sidi Ali Ben Aoun'],
    'Siliana': ['Siliana Ville', 'Bargou', 'Bou Arada', 'El Aroussa', 'El Krib', 'Gaâfour', 'Kesra', 'Makthar', 'Rouhia'],
    'Sousse': ['Sousse Ville', 'Akouda', 'Bouficha', 'Enfida', 'Hammam Sousse', 'Hergla', 'Kalâa Kebira', 'Kalâa Seghira', 'Kondar', 'Messaadine', 'Msaken', 'Sidi Bou Ali', 'Sidi El Hani', 'Zouhour'],
    'Tataouine': ['Tataouine Ville', 'Bir Lahmar', 'Dehiba', 'Ghomrassen', 'Remada', 'Smâr'],
    'Tozeur': ['Tozeur Ville', 'Degache', 'Hazoua', 'Nefta', 'Tamerza'],
    'Tunis': ['Tunis Ville', 'Bab El Bhar', 'Bab Souika', 'Carthage', 'La Goulette', 'Le Bardo', 'Menzah', 'Sidi Hassine'],
    'Zaghouan': ['Zaghouan Ville', 'Bir Mcherga', 'El Fahs', 'Nadhour', 'Saouaf', 'Zriba']
  };

  codesPostauxParVille: { [key: string]: string } = {
    // Ariana
    'Ariana Ville': '2080', 'Ettadhamen': '2041', 'Mnihla': '2081', 'Raoued': '2082',
    'Sidi Thabet': '2020', 'Soukra': '2036', 'Kalâat el-Andalous': '2083',

    // Béja
    'Béja Ville': '9000', 'Amdoun': '9021', 'Goubellat': '9070', 'Medjez el-Bab': '9070',
    'Nefza': '9022', 'Teboursouk': '9050', 'Testour': '9070', 'Thibar': '9010',

    // Ben Arous
    'Ben Arous Ville': '2013', 'Bou Mhel el-Bassatine': '2097', 'El Mourouj': '2074',
    'Ezzahra': '2038', 'Fouchana': '2094', 'Hammam Lif': '2050', 'Hammam Chott': '2060',
    'Mohamedia': '2091', 'Mornag': '2090', 'Radès': '2040',

    // Bizerte
    'Bizerte Ville': '7000', 'El Alia': '7010', 'Ghar El Melh': '7035', 'Mateur': '7030',
    'Menzel Bourguiba': '7050', 'Menzel Jemil': '7020', 'Ras Jebel': '7021', 'Sejnane': '7034',
    'Tinja': '7011', 'Utique': '7051', 'Zarzouna': '7025',

    // Gabès
    'Gabès Ville': '6000', 'El Hamma': '6020', 'Ghannouch': '6011', 'Mareth': '6040',
    'Matmata': '6070', 'Menzel Habib': '6060', 'Métouia': '6030', 'Nouvelle Matmata': '6071',

    // Gafsa
    'Gafsa Ville': '2100', 'El Guettar': '2111', 'El Ksar': '2112', 'Mdhilla': '2121',
    'Métlaoui': '2130', 'Moularès': '2120', 'Redeyef': '2140', 'Sened': '2141',

    // Jendouba
    'Jendouba Ville': '8100', 'Aïn Draham': '8130', 'Balta-Bou Aouane': '8142', 'Bou Salem': '8150',
    'Fernana': '8140', 'Ghardimaou': '8160', 'Oued Meliz': '8170', 'Tabarka': '8110',

    // Kairouan
    'Kairouan Ville': '3100', 'Alaâ': '3111', 'Bou Hajla': '3121', 'Chebika': '3131',
    'Echrarda': '3132', 'Haffouz': '3120', 'Hajeb El Ayoun': '3110', 'Nasrallah': '3140',
    'Oueslatia': '3130', 'Sbikha': '3122',

    // Kasserine
    'Kasserine Ville': '1200', 'Fériana': '1221', 'Foussana': '1222', 'Haïdra': '1240',
    'Jedelienne': '1231', 'Majel Bel Abbès': '1232', 'Sbiba': '1210', 'Thala': '1220',

    // Kébili
    'Kébili Ville': '4200', 'Douz': '4260', 'Faouar': '4210', 'Souk El Ahad': '4230',

    // Kef
    'Le Kef Ville': '7100', 'Dahmani': '7110', 'Jérissa': '7120', 'El Ksour': '7130',
    'Kalâat Khasba': '7140', 'Kalâat Senan': '7150', 'Nebeur': '7160', 'Sakiet Sidi Youssef': '7170',
    'Tajerouine': '7180',

    // Mahdia
    'Mahdia Ville': '5100', 'Bou Merdes': '5111', 'Chebba': '5120', 'El Jem': '5160',
    'Essouassi': '5131', 'Hbira': '5132', 'Ksour Essef': '5140', 'Melloulèche': '5150',
    'Ouled Chamekh': '5110', 'Rejiche': '5170', 'Sidi Alouane': '5180',

    // Manouba
    'Manouba Ville': '2010', 'Borj El Amri': '2021', 'Den Den': '2022', 'Douar Hicher': '2037',
    'El Battan': '2031', 'Mornaguia': '2032', 'Oued Ellil': '2035', 'Tebourba': '2030',

    // Médenine
    'Médenine Ville': '4100', 'Ben Gardane': '4160', 'Beni Khedache': '4170', 'Djerba - Ajim': '4111',
    'Djerba - Houmt Souk': '4110', 'Djerba - Midoun': '4116', 'Zarzis': '4170', 'Sidi Makhlouf': '4121',

    // Monastir
    'Monastir Ville': '5000', 'Bekalta': '5011', 'Bembla': '5021', 'Beni Hassen': '5031',
    'Jemmal': '5020', 'Ksar Hellal': '5070', 'Ksibet el-Médiouni': '5041', 'Moknine': '5050',
    'Ouerdanin': '5061', 'Sahline': '5010', 'Sayada': '5030', 'Téboulba': '5080',

    // Nabeul
    'Nabeul Ville': '8000', 'Béni Khalled': '8031', 'Béni Khiar': '8032', 'Bou Argoub': '8041',
    'Dar Chaâbane': '8011', 'El Haouaria': '8042', 'El Mida': '8043', 'Grombalia': '8030',
    'Hammamet': '8050', 'Kélibia': '8090', 'Korba': '8070', 'Menzel Bouzelfa': '8060',
    'Menzel Temime': '8080', 'Soliman': '8020', 'Takelsa': '8040',

    // Sfax
    'Sfax Ville': '3000', 'Agareb': '3021', 'Bir Ali Ben Khalifa': '3031', 'El Amra': '3022',
    'El Hencha': '3023', 'Graïba': '3024', 'Jebiniana': '3025', 'Kerkennah': '3070',
    'Mahrès': '3041', 'Menzel Chaker': '3011', 'Sakiet Eddaïer': '3020', 'Sakiet Ezzit': '3010',
    'Skhira': '3060', 'Thyna': '3050',

    // Sidi Bouzid
    'Sidi Bouzid Ville': '9100', 'Bir El Hafey': '9111', 'Cebbala Ouled Asker': '9121',
    'Jilma': '9131', 'Meknassy': '9141', 'Menzel Bouzaiane': '9151', 'Mezzouna': '9161',
    'Ouled Haffouz': '9171', 'Regueb': '9170', 'Sidi Ali Ben Aoun': '9181',

    // Siliana
    'Siliana Ville': '6100', 'Bargou': '6111', 'Bou Arada': '6121', 'El Aroussa': '6131',
    'El Krib': '6141', 'Gaâfour': '6150', 'Kesra': '6160', 'Makthar': '6170', 'Rouhia': '6180',

    // Sousse
    'Sousse Ville': '4000', 'Akouda': '4021', 'Bouficha': '4031', 'Enfida': '4030',
    'Hammam Sousse': '4011', 'Hergla': '4041', 'Kalâa Kebira': '4051', 'Kalâa Seghira': '4052',
    'Kondar': '4061', 'Messaadine': '4071', 'M\'saken': '4070', 'Sidi Bou Ali': '4081',
    'Sidi El Hani': '4091', 'Zouhour': '4020',

    // Tataouine
    'Tataouine Ville': '3200', 'Bir Lahmar': '3211', 'Dehiba': '3221', 'Ghomrassen': '3231',
    'Remada': '3240', 'Smâr': '3251',

    // Tozeur
    'Tozeur Ville': '2200', 'Degache': '2211', 'Hazoua': '2221', 'Nefta': '2230', 'Tamerza': '2241',

    // Tunis
    'Tunis Ville': '1000', 'Bab El Bhar': '1006', 'Bab Souika': '1007', 'Carthage': '2016',
    'La Goulette': '2060', 'Le Bardo': '2000', 'Menzah': '2092', 'Sidi Hassine': '2053',

    // Zaghouan
    'Zaghouan Ville': '1100', 'Bir Mcherga': '1111', 'El Fahs': '1120', 'Nadhour': '1131',
    'Saouaf': '1141', 'Zriba': '1151'
  };
   emailExists = false;
  cinExists = false;
  emailChecking = false;
  cinChecking = false;
  invalidDateNaissance=false;
  invalidDateDebutTravai=false;
  showPassword = false;
  showConfirmPassword = false;
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
      cin: ['', [
        Validators.required,
        Validators.pattern(/^\d{8}$/)
      ], [this.cinAsyncValidator.bind(this)]],
      telephone:  ['', [
    Validators.required,
    Validators.pattern(/^[2-5,9]\d{7}$/)
  ]],
      email: ['',
        [Validators.required, Validators.email],
        [this.emailAsyncValidator.bind(this)]
      ],
      dateNaissance:['', [Validators.required, this.dateNaissanceValidator()]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      // Adresse
      rue: ['', Validators.required],
      gouvernat: ['', Validators.required],
      ville: ['', Validators.required],
      codePostal: ['', Validators.required],
      // Informations spécifiques à l'agent de service
      specialite: ['', Validators.required],
      dateEmbauche: ['', [Validators.required,this.dateDebutTravailValidator()]]
    }, { validators: this.passwordMatchValidator });
     // Watch for gouvernat changes to update villes
     this.agentServiceForm.get('gouvernat')?.valueChanges.subscribe(gouvernat => {
      this.villes = this.villesParGouvernorat[gouvernat] || [];
      this.agentServiceForm.get('ville')?.reset();
      this.agentServiceForm.get('codePostal')?.reset();
    });

    // Watch for ville changes to update codePostal
    this.agentServiceForm.get('ville')?.valueChanges.subscribe(ville => {
      const codePostal = this.codesPostauxParVille[ville] || '';
      this.agentServiceForm.get('codePostal')?.setValue(codePostal);
    });
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
      Cin: Number(this.agentServiceForm.value.cin),
      telephone: this.agentServiceForm.value.telephone,
      email: this.agentServiceForm.value.email,
      date_naissance: new Date(this.agentServiceForm.value.dateNaissance),
      password: this.agentServiceForm.value.password,
      role:"agent service",
      adresse: {
        rue: this.agentServiceForm.value.rue,
        ville: this.agentServiceForm.value.ville,
        codePostal:Number(this.agentServiceForm.value.codePostal),
        gouvernat: this.agentServiceForm.value.gouvernat,
        pays: 'Tunisie',
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
   dateNaissanceValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = new Date(control.value);
    const minDate = new Date('1970-01-01');
    const maxDate = new Date('2000-12-31');
    if (value < minDate || value > maxDate) {
      return { invalidDateNaissance: true };
    }
    return null;
  };
}

// Validator pour dateDebutTravail : min 1985, max aujourd’hui
dateDebutTravailValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = new Date(control.value);
    const minDate = new Date('1985-01-01');
    const today = new Date();
    if (value < minDate || value > today) {
      return { invalidDateDebutTravail: true };
    }
    return null;
  };
}
emailAsyncValidator(control: AbstractControl) {
    return new Promise<ValidationErrors | null>((resolve) => {
      const email = control.value;
      if (!email || control.errors) {
        return resolve(null);
      }

      this.emailChecking = true;
      this.http.get<{ exists: boolean }>(`http://localhost:3000/auth/check-email/${email}`)
        .subscribe({
          next: (response) => {
            this.emailChecking = false;
            this.emailExists = response.exists;
            if (response.exists) {
              resolve({ emailExists: true });
            } else {
              resolve(null);
            }
          },
          error: () => {
            this.emailChecking = false;
            resolve(null);
          }
        });
    });
  }

  // Validateur asynchrone pour le CIN
  cinAsyncValidator(control: AbstractControl) {
    return new Promise<ValidationErrors | null>((resolve) => {
      const cin = control.value;
      if (!cin || control.errors) {
        return resolve(null);
      }

      this.cinChecking = true;
      this.http.get<{ exists: boolean }>(`http://localhost:3000/auth/check-cin/${cin}`)
        .subscribe({
          next: (response) => {
            this.cinChecking = false;
            this.cinExists = response.exists;
            if (response.exists) {
              resolve({ cinExists: true });
            } else {
              resolve(null);
            }
          },
          error: () => {
            this.cinChecking = false;
            resolve(null);
          }
        });
    });
  }
}
