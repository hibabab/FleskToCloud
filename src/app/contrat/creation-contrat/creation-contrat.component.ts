import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Enum pour les types de garanties
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

@Component({
  selector: 'app-creation-contrat',
  standalone: false,
  templateUrl: './creation-contrat.component.html',
  styleUrls: ['./creation-contrat.component.css'],
})
export class CreationContratComponent {
  insuranceForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.insuranceForm = this.fb.group({
      assure: this.fb.group({
        nom: ['', Validators.required],
        prenom: ['', Validators.required],
        Cin: ['', Validators.required],
        adresse: ['', Validators.required],
        codePostal: ['', Validators.required],
        telephone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        bonusMalus: ['', Validators.required]
      }),
      vehicule: this.fb.group({
        type: ['', Validators.required],
        marque: ['', Validators.required],
        model: ['', Validators.required],
        Imat: ['', [Validators.required, Validators.pattern(/^\d{4}TU\d{2,3}$/)]],
        energie: ['', Validators.required],
        nbPlace: ['', Validators.required],
        DPMC: ['', Validators.required],
        cylindree: ['', Validators.required],
        chargeUtil: [''],
        valeurNeuf: ['', Validators.required],
        numChassis: ['', Validators.required],
        poidsVide: ['', Validators.required],
        puissance: ['', Validators.required]
      }),
      contrat: this.fb.group({
        packChoisi: ['', Validators.required],
        typePaiement: ['', Validators.required],
        NatureContrat:['', Validators.required]
      })
    });
  }

  onSubmit() {
    // Vérifier si le formulaire est valide
    if (this.insuranceForm.valid) {
      const assureData = this.insuranceForm.get('assure')?.value;
      const vehiculeData = this.insuranceForm.get('vehicule')?.value;
      const contratData = this.insuranceForm.get('contrat')?.value;

      // Convertir bonusMalus en nombre entier
      assureData.bonusMalus = Number(assureData.bonusMalus);

      // Debug: Affichage des données de chaque groupe de formulaire
      console.log('Assuré:', assureData);
      console.log('Véhicule:', vehiculeData);
      console.log('Contrat:', contratData);

      if (assureData && vehiculeData && contratData) {
        // Calcul des garanties
        const garanties = this.calculateGaranties(contratData.packChoisi, vehiculeData,Number(assureData.bonusMalus));

        // Création du contrat
        const contratAuto = this.createContratAuto(assureData, vehiculeData, contratData, garanties);

        const apiUrl = 'http://localhost:3000/api/createCA'; // Assurez-vous que l'URL API est correcte
        this.http.post(apiUrl, contratAuto).subscribe(
          response => {
            console.log('Contrat créé avec succès:', response);
          },
          error => {
            console.error('Erreur lors de la création du contrat:', error);
          }
        );
      } else {
        console.error('Données manquantes dans l\'un des groupes de formulaire.');
      }
    } else {
      console.error('Le formulaire est invalide.');
      // Debug: Affichage des erreurs du formulaire
      console.log(this.insuranceForm.errors);
    }
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
    return cotisation;
  }

  calculateGaranties(packChoisi: string, vehiculeData: any, bonusMalus: number): any[] {
    const garanties = [];
    const valeurNeuf = vehiculeData.valeurNeuf;
    const puissance = vehiculeData.puissance;
    const responsabiliteCivile = this.calculateResponsabiliteCivile(vehiculeData.type, bonusMalus,vehiculeData.puissance);

    if (packChoisi === 'Pack1') {
      garanties.push({
        type: TypeGaranties.ResponsabiliteCivile,
        cotisationNette: responsabiliteCivile
      });
      garanties.push({
        type: TypeGaranties.RTI,
        cotisationNette: 0
      });
      garanties.push({
        type: TypeGaranties.DefenseEtRecours,
        capital: 1000,
        cotisationNette: 50.0
      });
      garanties.push({
        type: TypeGaranties.Incendie,
        capital: valeurNeuf,
        cotisationNette: valeurNeuf / 220.115
      });
      garanties.push({
        type: TypeGaranties.Vol,
        capital: valeurNeuf,
        cotisationNette: valeurNeuf / 336.446
      });
      garanties.push({
        type: TypeGaranties.PersonneTransportees,
        capital: 5000,
        cotisationNette: 50.0
      });
      garanties.push({
        type: TypeGaranties.BrisDeGlaces,
        capital: valeurNeuf <= 30000 ? 500 : 600,
        cotisationNette: (valeurNeuf <= 30000 ? 500 : 600) / 100 * 7.5
      });
      garanties.push({
        type: TypeGaranties.AssistanceAutomobile,
        cotisationNette: 71.5
      });
      garanties.push({
        type: TypeGaranties.IndividuelAccidentConducteur,
        capital: 20000,
        cotisationNette: 25.0
      });
    } else if (packChoisi === 'Pack2') {
      garanties.push({
        type: TypeGaranties.ResponsabiliteCivile,
        cotisationNette: responsabiliteCivile
      });
      garanties.push({
        type: TypeGaranties.RTI,
        cotisationNette: 0
      });
      garanties.push({
        type: TypeGaranties.DefenseEtRecours,
        capital: 1000,
        cotisationNette: 50.0
      });
      garanties.push({
        type: TypeGaranties.Incendie,
        capital: valeurNeuf,
        cotisationNette: valeurNeuf / 220.115
      });
      garanties.push({
        type: TypeGaranties.Vol,
        capital: valeurNeuf,
        cotisationNette: valeurNeuf / 336.446
      });
      garanties.push({
        type: TypeGaranties.PersonneTransportees,
        capital: 5000,
        cotisationNette: 50.0
      });
      garanties.push({
        type: TypeGaranties.BrisDeGlaces,
        capital: valeurNeuf <= 30000 ? 500 : 600,
        cotisationNette: (valeurNeuf <= 30000 ? 500 : 600) / 100 * 7.5
      });
      garanties.push({
        type: TypeGaranties.AssistanceAutomobile,
        cotisationNette: 71.5
      });
      garanties.push({
        type: TypeGaranties.IndividuelAccidentConducteur,
        capital: 20000,
        cotisationNette: 25.0
      });
      garanties.push({
        type: TypeGaranties.EVENEMENTCLIMATIQUE,
        cotisationNette: 25.0
      });
      garanties.push({
        type: TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE,
        cotisationNette: 25.0
      });
      garanties.push({
        type: TypeGaranties.DOMMAGEETCOLLIDION,
        capital: valeurNeuf,
        cotisationNette: valeurNeuf * 0.1
      });
    } else if (packChoisi === 'Pack3') {
      garanties.push({
        type: TypeGaranties.RTI,
        cotisationNette: 0
      });
      garanties.push({
        type: TypeGaranties.DefenseEtRecours,
        capital: 1000,
        cotisationNette: 50.0
      });
      garanties.push({
        type: TypeGaranties.Incendie,
        capital: valeurNeuf,
        cotisationNette: valeurNeuf / 220.115
      });
      garanties.push({
        type: TypeGaranties.Vol,
        capital: valeurNeuf,
        cotisationNette: valeurNeuf / 336.446
      });
      garanties.push({
        type: TypeGaranties.PersonneTransportees,
        capital: 5000,
        cotisationNette: 50.0
      });
      garanties.push({
        type: TypeGaranties.BrisDeGlaces,
        capital: valeurNeuf <= 30000 ? 500 : 600,
        cotisationNette: (valeurNeuf <= 30000 ? 500 : 600) / 100 * 7.5
      });
      garanties.push({
        type: TypeGaranties.AssistanceAutomobile,
        cotisationNette: 71.5
      });
      garanties.push({
        type: TypeGaranties.IndividuelAccidentConducteur,
        capital: 20000,
        cotisationNette: 25.0
      });
      garanties.push({
        type: TypeGaranties.EVENEMENTCLIMATIQUE,
        cotisationNette: 25.0
      });
      garanties.push({
        type: TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE,
        cotisationNette: 25.0
      });
      garanties.push({
        type: TypeGaranties.Tierce,
        capital: valeurNeuf,
        franchise: 0.2,
        cotisationNette: valeurNeuf * 0.2
      });
      garanties.push({
        type: TypeGaranties.ResponsabiliteCivile,
        cotisationNette: responsabiliteCivile
      });
    }

    return garanties;
  }

  createContratAuto(assureData: any, vehiculeData: any, contratData: any, garanties: any[]): any {
    const today = new Date();
    const dateSouscription = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
    const dateExpiration = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];
    const echeances = dateExpiration;

    if (!garanties || garanties.length === 0) {
      console.error('Aucune garantie fournie.');
      return null;
    }

    const cotisationNette = garanties.reduce((sum, garantie) => sum + garantie.cotisationNette, 0);
    const cotisationTotale = cotisationNette + 70.000 + 3.800 + 0.800 + 10.000 + 3.000 + 1.000;
    // Calcul du montantEcheance en fonction du type de paiement
    const montantEcheance = contratData.typePaiement === 'Semestriel' ? cotisationTotale / 2 : cotisationTotale;

    const contratAuto = {
      assure: assureData,
      vehicule: vehiculeData,
      contrat: {
        ...contratData,
        NatureContrat: contratData.NatureContrat,
        typePaiement:contratData.typePaiement ,
        dateSouscription,
        dateExpiration,
        echeances,
        cotisationNette,
        cotisationTotale,
        montantEcheance,
        garanties
      }
    };

    console.log('Données envoyées au backend:', contratAuto);
    return contratAuto;
  }
}
