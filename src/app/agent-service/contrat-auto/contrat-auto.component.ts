import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

export enum TypeGaranties {
  ResponsabiliteCivile = 'ResponsabiliteCivile',
  RTI = 'RTI',
  DefenseEtRecours = 'DefenseEtRecours',
  Incendie = 'Incendie',
  Vol = 'Vol',
  PersonneTransportees = 'PersonneTransportees',
  BrisDeGlaces = 'BrisDeGlaces',
  Tierce = 'Tierce',
  AssistanceAutomobile = 'AssistanceAutomobile',
  IndividuelAccidentConducteur = 'IndividuelAccidentConducteur',
  EVENEMENTCLIMATIQUE = 'Evènements climatiques',
  GREVESEMEUTESETMOUVEMENTPOPULAIRE = 'Grèves Emeutes et Mouvements populaires',
  DOMMAGEETCOLLIDION = 'Dommage et Collision'
}
interface AssureDto {
  bonusMalus: number;
}

interface CreateVehiculeDto {
  type: string;
  marque: string;
  model: string;
  Imat: string;
  energie: string;
  nbPlace: number;
  DPMC: string;
  cylindree: string;
  chargeUtil?: string;
  valeurNeuf: number;
  numChassis: string;
  poidsVide: number;
  puissance: number;
}
interface CreateGarantiesDto {
  type: TypeGaranties;
  capital?: number;
  cotisationNette: number;
  franchise?: number;
}
interface ContratAutoDto {
  dateSouscription: string;
  dateExpiration: string;
  NatureContrat: string;
  typePaiement: string;
  echeances: string;
  cotisationNette: number;
  packChoisi?: string;
  cotisationTotale: number;
  montantEcheance: number;
  garanties?: CreateGarantiesDto[];
}
@Component({
  selector: 'app-contrat-auto',
  standalone:false,
  templateUrl: './contrat-auto.component.html',
  styleUrls: ['./contrat-auto.component.css']
})
export class ContratAutoComponent implements OnInit {
  currentStep = 1;
  Cin = '';
  cinError = '';
  insuranceForm: FormGroup;
  templateGaranties: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.insuranceForm = this.fb.group({
      bonusMalus: ['', [Validators.required, Validators.min(0)]],
      vehicule: this.fb.group({
        type: ['', Validators.required],
        marque: ['', Validators.required],
        model: ['', Validators.required],
        Imat: ['', [Validators.required, this.validateImmatriculation]],
        energie: ['', Validators.required],
        nbPlace: ['', [Validators.required, Validators.min(1)]],
        DPMC: ['', Validators.required],
        cylindree: ['', Validators.required],
        chargeUtil: [''],
        valeurNeuf: ['', [Validators.required, Validators.min(0)]],
        numChassis: ['', Validators.required],
        poidsVide: ['', [Validators.required, Validators.min(0)]],
        puissance: ['', [Validators.required, Validators.min(0)]]
      }),
      contrat: this.fb.group({
        packChoisi: ['', Validators.required],
        typePaiement: ['', Validators.required],
        NatureContrat: ['', Validators.required]
      })
    });
  }

  ngOnInit(): void {
    this.loadTemplateGaranties();
  }

  private loadTemplateGaranties(): void {
    this.http.get<any[]>('http://localhost:3000/contrat-auto-geteway/template-garanties')
      .subscribe({
        next: (garanties) => {
          this.templateGaranties = garanties.map(g => ({
            ...g,
            capital: g.capital ? this.roundToThreeDecimals(g.capital) : undefined,
            cotisationNette: g.cotisationNette ? this.roundToThreeDecimals(g.cotisationNette) : undefined
          }));
        },
        error: (err) => {
          console.error('Erreur lors du chargement des garanties fixes:', err);
        }
      });
  }

  private roundToThreeDecimals(value: number): number {
    return parseFloat(value.toFixed(3));
  }

  validateImmatriculation(control: AbstractControl): {[key: string]: any} | null {
    const pattern = /^\d{4}TU\d{3}$/;
    if (control.value && !pattern.test(control.value)) {
      return { 'invalidImmatriculation': true };
    }
    return null;
  }

  verifyCin(): void {
    if (!this.Cin) {
      this.cinError = 'Le numéro CIN est requis';
      return;
    }

    if (this.Cin.length < 8) {
      this.cinError = 'Le numéro CIN doit contenir au moins 8 caractères';
      return;
    }

    this.currentStep = 2;
    this.cinError = '';
  }

  previousStep(): void {
    this.currentStep = 1;
  }

  redirectToRegistration(): void {
    this.router.navigate(['/inscription']);
  }

  calculateResponsabiliteCivile(typeVehicule: string, bonusMalus: number, puissance: number): number {
    let cotisation = 0;

    if (typeVehicule === 'Tourisme') {
      switch (bonusMalus) {
        case 11:
          if (puissance === 4) cotisation = 385;
          else if (puissance === 5) cotisation = 490;
          else if (puissance === 7) cotisation = 595;
          break;
        case 10:
          if (puissance === 4) cotisation = 330;
          else if (puissance === 5) cotisation = 420;
          else if (puissance === 7) cotisation = 510;
          break;
        case 9:
          if (puissance === 4) cotisation = 275;
          else if (puissance === 5) cotisation = 350;
          else if (puissance === 7) cotisation = 425;
          break;
        case 8:
          if (puissance === 4) cotisation = 220;
          else if (puissance === 5) cotisation = 280;
          else if (puissance === 7) cotisation = 340;
          break;
        case 7:
          if (puissance === 4) cotisation = 176;
          else if (puissance === 5) cotisation = 224;
          else if (puissance === 7) cotisation = 272;
          break;
        case 6:
          if (puissance === 4) cotisation = 154;
          else if (puissance === 5) cotisation = 196;
          else if (puissance === 7) cotisation = 238;
          break;
        case 5:
          if (puissance === 4) cotisation = 132;
          else if (puissance === 5) cotisation = 168;
          else if (puissance === 7) cotisation = 204;
          break;
        case 4:
          if (puissance === 4) cotisation = 110;
          else if (puissance === 5) cotisation = 140;
          else if (puissance === 7) cotisation = 170;
          break;
        case 3:
          if (puissance === 4) cotisation = 99;
          else if (puissance === 5) cotisation = 126;
          else if (puissance === 7) cotisation = 153;
          break;
        case 2:
          if (puissance === 4) cotisation = 88;
          else if (puissance === 5) cotisation = 112;
          else if (puissance === 7) cotisation = 136;
          break;
        case 1:
          if (puissance === 4) cotisation = 77;
          else if (puissance === 5) cotisation = 98;
          else if (puissance === 7) cotisation = 119;
          break;
        default:
          cotisation = 0;
      }
    } else if (typeVehicule === 'Utilitaire') {
      switch (bonusMalus) {
        case 7:
          if (puissance >= 5 && puissance <= 6) cotisation = 428;
          else if (puissance >= 7 && puissance <= 9) cotisation = 524;
          else if (puissance >= 11 && puissance <= 12) cotisation = 676;
          break;
        case 6:
          if (puissance >= 5 && puissance <= 6) cotisation = 363.8;
          else if (puissance >= 7 && puissance <= 9) cotisation = 445.4;
          else if (puissance >= 11 && puissance <= 12) cotisation = 574.6;
          break;
        case 5:
          if (puissance >= 5 && puissance <= 6) cotisation = 321;
          else if (puissance >= 7 && puissance <= 9) cotisation = 393;
          else if (puissance >= 11 && puissance <= 12) cotisation = 507;
          break;
        case 4:
          if (puissance >= 5 && puissance <= 6) cotisation = 256.8;
          else if (puissance >= 7 && puissance <= 9) cotisation = 314.4;
          else if (puissance >= 11 && puissance <= 12) cotisation = 405.6;
          break;
        case 3:
          if (puissance >= 5 && puissance <= 6) cotisation = 214;
          else if (puissance >= 7 && puissance <= 9) cotisation = 262;
          else if (puissance >= 11 && puissance <= 12) cotisation = 338;
          break;
        case 2:
          if (puissance >= 5 && puissance <= 6) cotisation = 192.6;
          else if (puissance >= 7 && puissance <= 9) cotisation = 235.8;
          else if (puissance >= 11 && puissance <= 12) cotisation = 304.2;
          break;
        case 1:
          if (puissance >= 5 && puissance <= 6) cotisation = 171.2;
          else if (puissance >= 7 && puissance <= 9) cotisation = 209.6;
          else if (puissance >= 11 && puissance <= 12) cotisation = 270.4;
          break;
        default:
          cotisation = 0;
      }
    }
    return this.roundToThreeDecimals(cotisation);
  }

  getGarantieFromTemplate(type: TypeGaranties): any {
    return this.templateGaranties.find(g => g.type === type) || {};
  }

  calculateGaranties(packChoisi: string, vehiculeData: any, bonusMalus: number): any[] {
    const garanties = [];
    const valeurNeuf = this.roundToThreeDecimals(vehiculeData.valeurNeuf);
    const puissance = vehiculeData.puissance;
    const responsabiliteCivile = this.calculateResponsabiliteCivile(vehiculeData.type, bonusMalus, puissance);

    if (packChoisi === 'Pack1') {
      garanties.push({
        type: TypeGaranties.ResponsabiliteCivile,
        cotisationNette: responsabiliteCivile
      });

      garanties.push({
        type: TypeGaranties.RTI,
        cotisationNette: 0.000
      });

      const defenseEtRecours = this.getGarantieFromTemplate(TypeGaranties.DefenseEtRecours);
      garanties.push({
        type: TypeGaranties.DefenseEtRecours,
        capital: defenseEtRecours.capital || 1000.000,
        cotisationNette: defenseEtRecours.cotisationNette || 50.000
      });

      garanties.push({
        type: TypeGaranties.Incendie,
        capital: valeurNeuf,
        cotisationNette: this.roundToThreeDecimals(valeurNeuf / 220.115)
      });

      garanties.push({
        type: TypeGaranties.Vol,
        capital: valeurNeuf,
        cotisationNette: this.roundToThreeDecimals(valeurNeuf / 336.446)
      });

      garanties.push({
        type: TypeGaranties.PersonneTransportees,
        capital: 5000.000,
        cotisationNette: 50.000
      });

      const brisGlacesCapital = this.roundToThreeDecimals(valeurNeuf <= 30000 ? 500.000 : 600.000);
      garanties.push({
        type: TypeGaranties.BrisDeGlaces,
        capital: brisGlacesCapital,
        cotisationNette: this.roundToThreeDecimals(brisGlacesCapital * 0.075)
      });

      const assistanceAuto = this.getGarantieFromTemplate(TypeGaranties.AssistanceAutomobile);
      garanties.push({
        type: TypeGaranties.AssistanceAutomobile,
        cotisationNette: assistanceAuto.cotisationNette || 71.500
      });

      const accidentConducteur = this.getGarantieFromTemplate(TypeGaranties.IndividuelAccidentConducteur);
      garanties.push({
        type: TypeGaranties.IndividuelAccidentConducteur,
        capital: accidentConducteur.capital || 20000.000,
        cotisationNette: accidentConducteur.cotisationNette || 25.000
      });
    }
    else if (packChoisi === 'Pack2') {
      garanties.push({
        type: TypeGaranties.ResponsabiliteCivile,
        cotisationNette: responsabiliteCivile
      });

      garanties.push({
        type: TypeGaranties.RTI,
        cotisationNette: 0.000
      });

      const defenseEtRecours = this.getGarantieFromTemplate(TypeGaranties.DefenseEtRecours);
      garanties.push({
        type: TypeGaranties.DefenseEtRecours,
        capital: defenseEtRecours.capital || 1000.000,
        cotisationNette: defenseEtRecours.cotisationNette || 50.000
      });

      garanties.push({
        type: TypeGaranties.Incendie,
        capital: valeurNeuf,
        cotisationNette: this.roundToThreeDecimals(valeurNeuf / 220.115)
      });

      garanties.push({
        type: TypeGaranties.Vol,
        capital: valeurNeuf,
        cotisationNette: this.roundToThreeDecimals(valeurNeuf / 336.446)
      });

      garanties.push({
        type: TypeGaranties.PersonneTransportees,
        capital: 5000.000,
        cotisationNette: 50.000
      });

      const brisGlacesCapital = this.roundToThreeDecimals(valeurNeuf <= 30000 ? 500.000 : 600.000);
      garanties.push({
        type: TypeGaranties.BrisDeGlaces,
        capital: brisGlacesCapital,
        cotisationNette: this.roundToThreeDecimals(brisGlacesCapital * 0.075)
      });

      const assistanceAuto = this.getGarantieFromTemplate(TypeGaranties.AssistanceAutomobile);
      garanties.push({
        type: TypeGaranties.AssistanceAutomobile,
        cotisationNette: assistanceAuto.cotisationNette || 71.500
      });

      const accidentConducteur = this.getGarantieFromTemplate(TypeGaranties.IndividuelAccidentConducteur);
      garanties.push({
        type: TypeGaranties.IndividuelAccidentConducteur,
        capital: accidentConducteur.capital || 20000.000,
        cotisationNette: accidentConducteur.cotisationNette || 25.000
      });

      const evenementClimatique = this.getGarantieFromTemplate(TypeGaranties.EVENEMENTCLIMATIQUE);
      garanties.push({
        type: TypeGaranties.EVENEMENTCLIMATIQUE,
        cotisationNette: evenementClimatique.cotisationNette || 25.000
      });

      const grevesEmeutes = this.getGarantieFromTemplate(TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE);
      garanties.push({
        type: TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE,
        cotisationNette: grevesEmeutes.cotisationNette || 25.000
      });

      garanties.push({
        type: TypeGaranties.DOMMAGEETCOLLIDION,
        capital: valeurNeuf,
        cotisationNette: this.roundToThreeDecimals(valeurNeuf * 0.1)
      });
    }
    else if (packChoisi === 'Pack3') {
      garanties.push({
        type: TypeGaranties.RTI,
        cotisationNette: 0.000
      });

      const defenseEtRecours = this.getGarantieFromTemplate(TypeGaranties.DefenseEtRecours);
      garanties.push({
        type: TypeGaranties.DefenseEtRecours,
        capital: defenseEtRecours.capital || 1000.000,
        cotisationNette: defenseEtRecours.cotisationNette || 50.000
      });

      garanties.push({
        type: TypeGaranties.Incendie,
        capital: valeurNeuf,
        cotisationNette: this.roundToThreeDecimals(valeurNeuf / 220.115)
      });

      garanties.push({
        type: TypeGaranties.Vol,
        capital: valeurNeuf,
        cotisationNette: this.roundToThreeDecimals(valeurNeuf / 336.446)
      });

      garanties.push({
        type: TypeGaranties.PersonneTransportees,
        capital: 5000.000,
        cotisationNette: 50.000
      });

      const brisGlacesCapital = this.roundToThreeDecimals(valeurNeuf <= 30000 ? 500.000 : 600.000);
      garanties.push({
        type: TypeGaranties.BrisDeGlaces,
        capital: brisGlacesCapital,
        cotisationNette: this.roundToThreeDecimals(brisGlacesCapital * 0.075)
      });

      const assistanceAuto = this.getGarantieFromTemplate(TypeGaranties.AssistanceAutomobile);
      garanties.push({
        type: TypeGaranties.AssistanceAutomobile,
        cotisationNette: assistanceAuto.cotisationNette || 71.500
      });

      const accidentConducteur = this.getGarantieFromTemplate(TypeGaranties.IndividuelAccidentConducteur);
      garanties.push({
        type: TypeGaranties.IndividuelAccidentConducteur,
        capital: accidentConducteur.capital || 20000.000,
        cotisationNette: accidentConducteur.cotisationNette || 25.000
      });

      const evenementClimatique = this.getGarantieFromTemplate(TypeGaranties.EVENEMENTCLIMATIQUE);
      garanties.push({
        type: TypeGaranties.EVENEMENTCLIMATIQUE,
        cotisationNette: evenementClimatique.cotisationNette || 25.000
      });

      const grevesEmeutes = this.getGarantieFromTemplate(TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE);
      garanties.push({
        type: TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE,
        cotisationNette: grevesEmeutes.cotisationNette || 25.000
      });

      garanties.push({
        type: TypeGaranties.Tierce,
        capital: valeurNeuf,
        franchise: 0.200,
        cotisationNette: this.roundToThreeDecimals(valeurNeuf * 0.2)
      });

      garanties.push({
        type: TypeGaranties.ResponsabiliteCivile,
        cotisationNette: responsabiliteCivile
      });
    }

    return garanties;
  }

  prepareContratData(): any {
    const formValue = this.insuranceForm.value;
    const bonusMalus = Number(formValue.bonusMalus);
    const vehiculeData = formValue.vehicule;
    const contratData = formValue.contrat;

    const garanties = this.calculateGaranties(
      contratData.packChoisi,
      vehiculeData,
      bonusMalus
    );

    const today = new Date();
    const dateSouscription = today.toISOString().split('T')[0];
    const dateExpiration = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];
    const echeances = dateExpiration;

    const cotisationNette = this.roundToThreeDecimals(
      garanties.reduce((sum, garantie) => sum + (garantie.cotisationNette || 0), 0)
    );

    const cotisationTotale = this.roundToThreeDecimals(
      cotisationNette + 50.000 + 3.800 + 0.800 + 10.000 + 3.000 + 1.000
    );

    const montantEcheance = contratData.typePaiement === 'Semestriel'
      ? this.roundToThreeDecimals(cotisationTotale / 2)
      : cotisationTotale;

    // Préparation des données pour le backend
    const dtoA: AssureDto = { bonusMalus };
    const Cin = this.Cin;
    const dtoV: CreateVehiculeDto = vehiculeData;
    const dtoC: ContratAutoDto = {
      dateSouscription,
      dateExpiration,
      NatureContrat: contratData.NatureContrat,
      typePaiement: contratData.typePaiement,
      echeances,
      cotisationNette,
      packChoisi: contratData.packChoisi,
      cotisationTotale,
      montantEcheance,
      garanties
    };

    // Ajout des logs pour vérifier les données
    console.log('Données à envoyer au backend:', {
      dtoA,
      Cin,
      dtoV,
      dtoC
    });

    return {
      dtoA,
      Cin,
      dtoV,
      dtoC
    };
  }
  onSubmit(): void {
    if (this.insuranceForm.invalid) {
      this.markFormGroupTouched(this.insuranceForm);
      console.error('Le formulaire est invalide');
      return;
    }

    const requestData = this.prepareContratData();
    console.log('Envoi des données au backend:', requestData);

    // Appeler l'API pour créer le contrat auto
    this.http.post('http://localhost:3000/contrat-auto-geteway/createCA', requestData).subscribe({
      next: (response) => {
        console.log('Réponse du backend:', response);
        // Redirection ou autre traitement après succès
      },
      error: (err) => {
        console.error('Erreur lors de la création du contrat:', err);
        if (err.error) {
          console.error('Détails de l\'erreur:', err.error);
        }
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
