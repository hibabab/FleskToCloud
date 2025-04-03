import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  dateEffet: string;
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
      bonusMalus: ['', [Validators.required, Validators.min(1)]],
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
  isLoading = false;

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
    this.router.navigate(['agent/compte']);
  }

  calculateResponsabiliteCivile(type: string, bonusMalus: number, puissance: number): number {
    let cotisation = 0;
    if (type === 'Tourisme') {
      switch (bonusMalus) {
        case 11:
          if (puissance === 4) cotisation = 385;
          else if (puissance === 5) cotisation = 490;
          else if (puissance === 6) cotisation = 490;
          else if (puissance === 7) cotisation = 595;
          break;
        case 10:
          if (puissance === 4) cotisation = 330;
          else if (puissance === 5) cotisation = 420;
          else if (puissance === 6) cotisation = 420;
          else if (puissance === 7) cotisation = 510;
          break;
        case 9:
          if (puissance === 4) cotisation = 275;
          else if (puissance === 5) cotisation = 350;
          else if (puissance === 6) cotisation = 350;
          else if (puissance === 7) cotisation = 425;
          break;
        case 8:
          if (puissance === 4) cotisation = 220;
          else if (puissance === 5) cotisation = 280;
          else if (puissance === 6) cotisation = 280;
          else if (puissance === 7) cotisation = 340;
          break;
        case 7:
          if (puissance === 4) cotisation = 176;
          else if (puissance === 5) cotisation = 224;
          else if (puissance === 6) cotisation = 224;
          else if (puissance === 7) cotisation = 272;
          break;
        case 6:
          if (puissance === 4) cotisation = 154;
          else if (puissance === 5) cotisation = 196;
          else if (puissance === 6) cotisation = 196;
          else if (puissance === 7) cotisation = 238;
          break;
        case 5:
          if (puissance === 4) cotisation = 132;
          else if (puissance === 5) cotisation = 168;
          else if (puissance === 6) cotisation = 168;
          else if (puissance === 7) cotisation = 204;
          break;
        case 4:
          if (puissance === 4) cotisation = 110;
          else if (puissance === 5) cotisation = 140;
          else if (puissance === 6) cotisation = 140;
          else if (puissance === 7) cotisation = 170;
          break;
        case 3:
          if (puissance === 4) cotisation = 99;
          else if (puissance === 5) cotisation = 126;
          else if (puissance === 6) cotisation = 126;
          else if (puissance === 7) cotisation = 153;
          break;
        case 2:
          if (puissance === 4) cotisation = 88;
          else if (puissance === 5) cotisation = 112;
          else if (puissance === 6) cotisation = 112;
          else if (puissance === 7) cotisation = 136;
          break;
        case 1:
          if (puissance === 4) cotisation = 77;
          else if (puissance === 5) cotisation = 98;
          else if (puissance === 6) cotisation = 98;
          else if (puissance === 7) cotisation = 119;
          break;
        default:
          cotisation = 0;
      }
    } else if (type === 'Utilitaire') {
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
    const dateEffet=dateSouscription;
    const dateExpiration = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];
    const date = new Date();
switch(contratData.typePaiement.toLowerCase()) {
  case 'mensuel':
    date.setMonth(date.getMonth() + 1);
    break;
  case 'trimestriel':
    date.setMonth(date.getMonth() + 3);
    break;
  case 'semestriel':
    date.setMonth(date.getMonth() + 6);
    break;
  case 'annuel':
    date.setFullYear(date.getFullYear() + 1);
    break;
  default:
    date.setMonth(date.getMonth() + 1);
}

const echeances = date.toISOString().split('T')[0];


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


    const  assure: AssureDto = { bonusMalus };
    const Cin = this.Cin;
    const dtoV: CreateVehiculeDto = vehiculeData;
    const dtoC: ContratAutoDto = {
      dateSouscription,
      dateExpiration,
      dateEffet,
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
      assure,
      Cin,
      dtoV,
      dtoC
    });

    return {
      assure: assure,
      Cin: this.Cin,
      vehicule: dtoV,  // changer de dtoV à vehicule
      contrat: dtoC    // changer de dtoC à contrat
    };
  }
  onSubmit(): void {
    if (this.insuranceForm.invalid) {
        this.markFormGroupTouched(this.insuranceForm);
        return;
    }

    const requestData = this.prepareContratData();
    this.isLoading = true;

    // Modifier le type de réponse attendue
    this.http.post<{success: boolean, data: any, message: string}>(
        'http://localhost:3000/contrat-auto-geteway/createCA',
        requestData
    ).subscribe({
        next: async (response) => {
            this.isLoading = false;

            if (response.success) {  // Vérifier response.success au lieu de response.status
                console.log('Contrat créé:', response.data);
                await this.generateContratPDF(response.data);  // Utiliser response.data au lieu de response.contrat

                // Réinitialiser le formulaire
                this.insuranceForm.reset();

                // Afficher un message de succès

            } else {
                console.error('Réponse inattendue:', response);

            }
        },
        error: (err: HttpErrorResponse) => {
            this.isLoading = false;
            console.error('Erreur:', err);

            let errorMessage = 'Erreur lors de la création du contrat';
            if (err.error?.message) {
                errorMessage = err.error.message;
            } else if (err.message) {
                errorMessage = err.message;
            }


        }
    });
}
async generateContratPDF(contratData: any): Promise<void> {
  try {
    const doc = new jsPDF('p', 'mm', 'a4') as any;
    doc.setFont('helvetica');

    // Variables de position
    let yOffset = 20;
    const margin = 15;
    const lineHeight = 7;
    const sectionSpacing = 5; // Réduit l'espacement entre sections

    // 1. En-tête avec logo
    try {
      const logoBase64 = await this.loadImageAsBase64('assets/images/logoFC.png');
      doc.addImage(logoBase64, 'PNG', margin, yOffset, 30, 30);
    } catch (error) {
      console.warn('Logo non chargé');
    }

    // Titre principal
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('CONTRAT D\'ASSURANCE AUTOMOBILE', 105, yOffset + 15, { align: 'center' });
    yOffset += 30; // Réduit l'espace après le titre

    // 2. Informations du contrat
    doc.setFontSize(12); // Taille de police réduite
    doc.text('INFORMATIONS DU CONTRAT', margin, yOffset);
    yOffset += lineHeight;

    autoTable(doc, {
      startY: yOffset,
      body: [
        ['N° Contrat','Code agence',  'N° Sociétaire','Date Souscription','Date Effet', 'Date Expiration', 'Nature', 'Échéances'],
        [
          contratData.contrat.id || 'N/A',
          133,
          contratData.assure?.numSouscription || 'N/A',
          contratData.contrat.dateSouscription || 'N/A',
          contratData.contrat.dateSouscription || 'N/A',
          contratData.contrat.dateExpiration || 'N/A',
          contratData.contrat.NatureContrat || 'N/A',
          contratData.contrat.echeances || 'N/A'
        ]
      ],
      styles: {
        fontSize: 8, // Taille de police réduite pour le tableau
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { fontStyle: 'bold' },
        2: { fontStyle: 'bold' },
        3: { fontStyle: 'bold' },
        4: { fontStyle: 'bold' },
        5: { fontStyle: 'bold' },
        6: { fontStyle: 'bold' },
        7: { fontStyle: 'bold' }}
    });
    yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

    // 3. Informations du sociétaire avec adresse
    doc.setFontSize(12);
    doc.text('INFORMATIONS SOCIÉTAIRE', margin, yOffset);
    yOffset += lineHeight;

    const assure = contratData.assure || {};
    const adresse = assure.adresse || {};

    autoTable(doc, {
      startY: yOffset,
      body: [
        ['Nom', 'Prénom', 'CIN', 'Téléphone', 'Bonus/Malus'],
        [
          assure.nom || 'N/A',
          assure.prenom || 'N/A',
          assure.Cin || 'N/A',
          assure.telephone || 'N/A',
          assure.bonusMalus || 'N/A'
        ],
        ['Adresse', 'Ville', 'Code Postal', 'Pays', ''],
        [
          adresse.rue || 'N/A',
          adresse.ville || 'N/A',
          adresse.codePostal || 'N/A',
          adresse.pays || 'N/A',
          ''
        ]
      ],
      styles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { fontStyle: 'bold' },
        2: { fontStyle: 'bold' },
        3: { fontStyle: 'bold' },
        4: { fontStyle: 'bold' }
      }
    });
    yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

    // 4. Caractéristiques du véhicule
    doc.setFontSize(12);
    doc.text('CARACTÉRISTIQUES DU VÉHICULE', margin, yOffset);
    yOffset += lineHeight;

    const vehicule = contratData.vehicule || {};
    autoTable(doc, {
      startY: yOffset,
      body: [
        ['Immatriculation', 'Marque', 'Modèle', 'Type', 'Puissance', 'Valeur neuve'],
        [
          vehicule.Imat || 'N/A',
          vehicule.marque || 'N/A',
          vehicule.model || 'N/A',
          vehicule.type || 'N/A',
          vehicule.puissance ? `${vehicule.puissance} CV` : 'N/A',
          vehicule.valeurNeuf ? `${vehicule.valeurNeuf} DT` : 'N/A'
        ],
        ['Énergie', 'Nb places', 'Cylindrée', 'Poids vide', 'Charge utile', 'N° chassis'],
        [
          vehicule.energie || 'N/A',
          vehicule.nbPlace || 'N/A',
          vehicule.cylindree || 'N/A',
          vehicule.poidsVide || 'N/A',
          vehicule.chargeUtil || 'N/A',
          vehicule.numChassis || 'N/A'
        ]
      ],
      styles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { fontStyle: 'bold' },
        2: { fontStyle: 'bold' },
        3: { fontStyle: 'bold' },
        4: { fontStyle: 'bold' },
        5: { fontStyle: 'bold' }
      }
    });
    yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

    // 5. Garanties (tableau visible)
    doc.setFontSize(12);
    doc.text('GARANTIES SOUSCRITES', margin, yOffset);
    yOffset += lineHeight;

    const garanties = contratData.garanties || [];
    autoTable(doc, {
      startY: yOffset,
      head: [['Garantie', 'Capital', 'Cotisation']],
      body: garanties.map((g: any) => [
        g.type || 'N/A',
        g.capital ? `${g.capital} DT` : '-',
        g.cotisationNette ? `${g.cotisationNette.toFixed(3)} DT` : '0.000 DT'
      ]),
      styles: {
        fontSize: 7, // Taille de police plus petite pour le tableau des garanties
      },
      headStyles: {
        fillColor: [0,30, 0],
        textColor: 255,
        fontSize: 8
      },
      margin: { left: margin }
    });
    yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

    // 6. Détails financiers
    doc.setFontSize(12);
    doc.text('DÉTAILS FINANCIERS', margin, yOffset);
    yOffset += lineHeight;

    autoTable(doc, {
      startY: yOffset,
      body: [
        ['Cotisation Nette', 'Cotisation Totale', 'Montant Échéance'],
        [
          contratData.contrat.cotisationNette ? `${contratData.contrat.cotisationNette.toFixed(3)} DT` : '0.000 DT',
          contratData.contrat.cotisationTotale ? `${contratData.contrat.cotisationTotale.toFixed(3)} DT` : '0.000 DT',
          contratData.contrat.montantEcheance ? `${contratData.contrat.montantEcheance.toFixed(3)} DT` : '0.000 DT'
        ]
      ],
      styles: {
        fontSize: 8,
        halign: 'right'
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left' },
        1: { fontStyle: 'bold' },
        2: { fontStyle: 'bold' }
      }
    });

    // 7. Signatures - position ajustée
    const signatureY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);

    // Signature du sociétaire
    doc.text('Le Sociétaire', margin + 20, signatureY);
    doc.line(margin + 20, signatureY + 2, margin + 70, signatureY + 2);

    // Signature du rédacteur
    const pageWidth = doc.internal.pageSize.width;
    doc.text('Le Rédacteur', pageWidth - margin - 70, signatureY);
    doc.line(pageWidth - margin - 70, signatureY + 2, pageWidth - margin - 20, signatureY + 2);

    // 8. Pied de page
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Flesk Cover - Tél: 24051646 - Email: contact@fleskcover.com', 105, 285, { align: 'center' });

    // Génération du fichier
    const fileName = `Contrat_Auto_${contratData.contrat.id || new Date().getTime()}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Erreur génération PDF:', error);
    this.showErrorAlert('Une erreur est survenue lors de la génération du contrat');
  }
}
// Méthode pour afficher les erreurs
private showErrorAlert(message: string): void {
  // À adapter selon votre système d'alertes
  alert(`Erreur: ${message}`);
}

loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = function() {
          if (this.status === 200) {
              const reader = new FileReader();
              reader.onloadend = function() {
                  resolve(reader.result as string);
              };
              reader.onerror = reject;
              reader.readAsDataURL(xhr.response);
          } else {
              reject(new Error('Failed to load image'));
          }
      };
      xhr.onerror = reject;
      xhr.send();
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
