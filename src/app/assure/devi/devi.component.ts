import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
@Component({
  selector: 'app-devi',
  standalone:false,
  templateUrl: './devi.component.html',
  styleUrls: ['./devi.component.css']
})
export class DeviComponent {
  etape: number = 1;
  formulaireEtape1: FormGroup;
  formulaireEtape2: FormGroup;
  formulaireEtape3: FormGroup;
  classesBonusMalus: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  packs: string[] = [
    'Pack Essentille', 'Tous les risques', 'Pack dommage et Collision'];
  cotisationNette: number = 0;
  cotisationTotale: number = 0;
  constructor(private fb: FormBuilder) {
    this.formulaireEtape1 = this.fb.group({
      type: ['', Validators.required],
      valeurNeuf: ['', Validators.required],
      marque: ['', Validators.required],
      model: ['', Validators.required],
      puissance: ['', Validators.required],
      DPMC: ['', [
        Validators.required,
        Validators.pattern(/^(19[7-9][1-9]|19[8-9]\d|20\d{2})$/)
      ]],
      Imat: ['', [Validators.required, Validators.pattern(/^\d{4}TU\d{2,3}$/)]]
    });
    this.formulaireEtape2 = this.fb.group({
      bonusMalus: ['', Validators.required],
      packChoisi: ['', Validators.required]
    });
    this.formulaireEtape3 = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      adresse: ['', Validators.required],
      codePostal: ['', Validators.required],
      tel: ['', Validators.required],
      CIN:['', Validators.required]
    });
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
    return cotisation;
  }

  calculateGaranties(packChoisi: string, formulaireEtape1: any, bonusMalus: number): any[] {
    const garanties: any[] = [];
    const valeurNeuf = formulaireEtape1.valeurNeuf;
    const puissance = formulaireEtape1.puissance;
    const responsabiliteCivile = this.calculateResponsabiliteCivile(formulaireEtape1.type, bonusMalus,puissance);
    if (packChoisi === 'Pack Essentille') {
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
        cotisationNette: Math.round((valeurNeuf / 220.115) * 1000) / 1000
      });
      garanties.push({
        type: TypeGaranties.Vol,
        capital: valeurNeuf,
        cotisationNette: Math.round((valeurNeuf / 336.446) * 1000) / 1000
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
    } else if (packChoisi === 'Pack dommage et Collision') {
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
        cotisationNette: Math.round((valeurNeuf / 220.115) * 1000) / 1000
      });
      garanties.push({
        type: TypeGaranties.Vol,
        cotisationNette: Math.round((valeurNeuf / 336.446) * 1000) / 1000
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
        cotisationNette: valeurNeuf * 0.05
      });
    } else if (packChoisi === 'Tous les risques') {
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
        cotisationNette: Math.round((valeurNeuf / 220.115) * 1000) / 1000
      });
      garanties.push({
        type: TypeGaranties.Vol,
        capital: valeurNeuf,
        cotisationNette: Math.round((valeurNeuf / 336.446) * 1000) / 1000
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
        cotisationNette: valeurNeuf * 0.02
      });
      garanties.push({
        type: TypeGaranties.ResponsabiliteCivile,
        cotisationNette: responsabiliteCivile
      });
    }

    return garanties;
  }

  calculateCotisations(garanties: any[]): void {
    this.cotisationNette = garanties.reduce((sum: number, garantie: any) => sum + garantie.cotisationNette, 0);
    this.cotisationTotale = this.cotisationNette + 50.000 + 3.800 + 0.800 + 10.000 + 3.000 + 1.000;
  }
  suivant() {
    if (this.etape === 1 && this.formulaireEtape1.invalid) {
      this.formulaireEtape1.markAllAsTouched();
      return;
    }
    if (this.etape === 2 && this.formulaireEtape2.invalid) {
      this.formulaireEtape2.markAllAsTouched();
      return;
    }
    if (this.etape < 3) {
      this.etape++;
    }
  }

  precedent() {
    if (this.etape > 1) {
      this.etape--;
    }
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

  soumettre() {
    const typeVoiture = this.formulaireEtape1.value.type;
    const bonusMalus = Number(this.formulaireEtape2.value.bonusMalus);
    const puissance = Number(this.formulaireEtape1.value.puissance);
    const anneeCourante = new Date().getFullYear();
    const ageVehicule = anneeCourante - Number(this.formulaireEtape1.value.DPMC);
    const packChoisi = this.formulaireEtape2.value.packChoisi;

    // Validate age and pack compatibility
    if ((ageVehicule > 15 && packChoisi === 'Pack dommage et Collision') ||
        (ageVehicule > 3 && packChoisi === 'Tous les risques')) {
        window.alert(`Erreur : Un véhicule de ${ageVehicule} ans ne peut pas choisir le pack ${packChoisi}.`);
        return;
    }
    // Validate for vehicle type "Utilitaire"
    if (typeVoiture === 'Utilitaire') {
        if (bonusMalus < 1 || bonusMalus > 7 || puissance < 5 || puissance > 12) {
            window.alert("Erreur : Pour un véhicule utilitaire, le bonus-malus doit être entre 1 et 7 et la puissance entre 5 et 12.");
            return;
        }
    }
    // Validate for vehicle type "Tourisme"
     if (typeVoiture === 'Tourisme') {
        if (bonusMalus < 1 || bonusMalus > 11 || puissance < 4 || puissance > 7) {
            window.alert("Erreur : Pour un véhicule de tourisme, le bonus-malus doit être entre 1 et 11 et la puissance entre 4 et 7.");
            return;
        }
    }
    const garanties = this.calculateGaranties(packChoisi, this.formulaireEtape1.value, bonusMalus);
    this.calculateCotisations(garanties);

    const formulaireComplet = {
        ...this.formulaireEtape1.value,
        ...this.formulaireEtape2.value,
        ...this.formulaireEtape3.value,
        cotisationNette: this.cotisationNette,
        cotisationTotale: this.cotisationTotale,
        garanties: garanties
    };

    console.log('Données complètes du formulaire:', formulaireComplet);

    const doc = new jsPDF();
doc.setFontSize(18);

this.loadImageAsBase64('assets/images/logoFC.png').then((logoBase64) => {
  let yOffset = 10; // Position verticale initiale

  // Ajouter l'image en haut à gauche
  doc.addImage(logoBase64, 'PNG', 10, yOffset, 50, 50);
  yOffset += 60; // Décalage après l'image

  // Titre du document
  doc.text('Devi Flesk Cover', 70, 30);
  yOffset += 10;

  // Informations de l'assuré en haut à droite
  doc.setFontSize(10); // Taille de police plus petite
  doc.text(`Nom: ${formulaireComplet.nom}`, 150, 20);
  doc.text(`Prénom: ${formulaireComplet.prenom}`, 150, 25);
  doc.text(`Bonus-Malus: ${formulaireComplet.bonusMalus}`, 150, 30);
  doc.text(`CIN: ${formulaireComplet.CIN}`, 150, 35);
  doc.text(`Téléphone: ${formulaireComplet.tel}`, 150, 40);

  // Ligne horizontale
  doc.setLineWidth(0.5);
  doc.line(10, yOffset, 200, yOffset);
  yOffset += 10;

  // Informations du véhicule
  doc.setFontSize(14);
  doc.text('Informations de véhicule:', 10, yOffset);
  yOffset += 10;

  // Réduire la taille de la police pour les détails
  doc.setFontSize(10);

  // Ligne 1 : Type de véhicule et Puissance
  doc.text(`Type: ${formulaireComplet.type}`, 10, yOffset);
  doc.text(`Puissance: ${formulaireComplet.puissance} chevaux`, 100, yOffset);
  yOffset += 10;

  // Ligne 2 : Âge du véhicule et Matricule
  doc.text(`Âge: ${ageVehicule} ans`, 10, yOffset);
  doc.text(`Matricule: ${formulaireComplet.Imat}`, 100, yOffset);
  yOffset += 15;

  // Ligne horizontale
  doc.setLineWidth(0.5);
  doc.line(10, yOffset, 200, yOffset);
  yOffset += 10;

  // Garanties et coûts
  doc.setFontSize(14);
  doc.text('Garanties et coûts:', 10, yOffset);
  yOffset += 10;
  doc.setFontSize(12);
  doc.text(`Pack Choisi: ${formulaireComplet.packChoisi}`, 10, yOffset);
  yOffset += 15;

  // Ajouter les garanties dans un tableau avec lignes alternées
  autoTable(doc, {
    startY: yOffset,
    head: [['Garantie', 'Coût']],
    body: formulaireComplet.garanties.map((garantie: { type: string, cotisationNette: number }) => [
      garantie.type, `${garantie.cotisationNette}DT`
    ]),
    styles: {
      fillColor: [255, 255, 255], // Couleur de fond par défaut (blanc)
      textColor: [0, 0, 0], // Couleur du texte par défaut (noir)
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240], // Couleur de fond pour les lignes paires (gris clair)
    },
  });

  // Cotisation totale en rouge et en gras
  yOffset = (doc as any).lastAutoTable.finalY + 10; // Position après le tableau
  doc.setFontSize(12);
  doc.setTextColor(255, 0, 0); // Rouge
  doc.setFont('helvetica', 'bold'); // Texte en gras
  doc.text(`Cotisation Totale: ${formulaireComplet.cotisationTotale.toFixed(2)}DT`, 10, yOffset);
  doc.setTextColor(0, 0, 0); // Réinitialiser la couleur du texte
  doc.setFont('helvetica', 'normal'); // Réinitialiser la police

  // Section "Pour nous contacter"
  doc.setFontSize(12);
  doc.text('Pour nous contacter :', 10, yOffset + 20);
  doc.text('Email: fleskcover@gmail.com', 10, yOffset + 25);
  doc.text('Téléphone: 24051646', 10, yOffset + 30);

  // Enregistrer le fichier PDF généré
  const pdfOutput = doc.output('blob');
  const fileURL = URL.createObjectURL(pdfOutput);
   // Afficher le PDF dans le navigateur
      window.open(fileURL, '_blank');
    });
  } }
