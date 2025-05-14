import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import SignaturePad from 'signature_pad';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehiculeComponent } from '../vehicule/vehicule.component';
import { ConstatService } from '../services/constat.service';
import { jwtDecode } from 'jwt-decode';
import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
interface PhotoData {
  file: File;
  preview: string;
  metadata?: any;
}

interface ImpactPoint {
  x: number;
  y: number;
  label: string;
  description: string;
  severity: string;
  rayure?: boolean;
  enfoncement?: boolean;
  brisure?: boolean;
  peinture?: boolean;
  photo?: string;
  formGroup?: FormGroup;
}


interface ImpactPoint {
  x: number;
  y: number;
  label: string;
  description: string;
  rayure?: boolean;
  enfoncement?: boolean;
  brisure?: boolean;
  peinture?: boolean;
  photo?: string;
  formGroup?: FormGroup;
  cssClass?: string;
}


@Component({
  selector: 'app-constat',
  standalone: false,
  templateUrl: './constat.component.html',
  styleUrls: ['./constat.component.css']  // Assurez-vous que c'est bien "styleUrls" et pas "styleUrl"
})
export class ConstatComponent implements OnInit {
  @ViewChild('sketchContainer') sketchContainer!: ElementRef<HTMLDivElement>;
  // Formulaires
  generalInfoForm!: FormGroup;
  temoins!: FormArray;
  constatForm!: FormGroup;
   // Données des véhicules
   vehiculeAData: any;
   vehiculeBData: any;
   
   // États de validation
   vehiculeAValid = false;
   vehiculeBValid = false;
   

// Méthode pour recevoir les données du composant véhicule


  
  
 
  onVehiculeStatusChange(status: { valid: boolean; data: any }, prefix: string) {
    if (prefix === 'A') {
      this.vehiculeAData = status.data;
      this.vehiculeAValid = status.valid;
      this.steps[0].valid = status.valid;
    } else {
      this.vehiculeBData = status.data;
      this.vehiculeBValid = status.valid;
      this.steps[1].valid = status.valid;
    }
  }
  
 

  // Étapes
  steps = [
    { title: 'Informations Générales', valid: false },
    { title: 'Conducteur A', valid: false },
    { title: 'Conducteur B', valid: false },
    { title: 'Circonstances', valid: false },
    { title: 'Croquis & Signatures', valid: false }
  ];
  currentStep = 0;

  // Circonstances
  selectedCirconstancesA: string[] = [];
  selectedCirconstancesB: string[] = [];
  circonstancesOptions = [
    { id: '1', label: 'en stationnement' },
    { id: '2', label: 'quittait un stationnement' },
    { id: '3', label: 'prenait un stationnement' },
    { id: '4', label: 'sortait d\'un parking, d\'un lieu privé, d\'un chemin de terre' },
    { id: '5', label: 's\'engageait dans un parking, un lieu privé, un chemin de terre' },
    { id: '6', label: 'arrêt de circulation' },
    { id: '7', label: 'frottement sans changement de file' },
    { id: '8', label: 'heurtait à l\'arrière, en roulant dans le même sens et sur une même file' },
    { id: '9', label: 'roulait dans le même sens et sur une file différente' },
    { id: '10', label: 'changeait de file' },
    { id: '11', label: 'doublait' },
    { id: '12', label: 'virait à droite' },
    { id: '13', label: 'virait à gauche' },
    { id: '14', label: 'reculait' },
    { id: '15', label: 'empiétait sur la partie de chaussée réservée à la circulation en sens inverse' },
    { id: '16', label: 'venait de droite (dans un carrefour)' },
    { id: '17', label: 'n\'avait pas observé le signal de priorité' }
  ];

  constructor(
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    
    private constatService: ConstatService // ✅ injection correcte
  ) {
    this.initializeForms();
  }
  

  ngOnInit(): void {
    // Initialisation supplémentaire si nécessaire
  }

  private initializeForms(): void {
    this.initializeGeneralInfoForm();
    this.initializeTemoinsArray();
    this.initializeMainForm();
  }

  private initializeGeneralInfoForm(): void {
    this.generalInfoForm = this.fb.group({
      dateAccident: ['', [Validators.required]],
      heureAccident: ['12:00'],
      degatsMateriels: [false],
      blesses: [false],
      rue: ['Rue Exemple'],
      ville: ['Tunis'],
      codePostal: [1000, [
        Validators.pattern(/^\d{4}$/),
        Validators.min(1000),
        Validators.max(9999)
      ]],
      pays: ['Tunisie'],
      gouvernat: ['Tunis'],
      numMaison: ['1']
    });
  }

  private initializeTemoinsArray(): void {
    this.temoins = this.fb.array([], {
      validators: this.atLeastOneTemoinValidator
    });
  }

  private initializeMainForm(): void {
    this.constatForm = this.fb.group({
      generalInfo: this.generalInfoForm,
      temoins: this.temoins
    });
  }

  createTemoinForm(): FormGroup {
    return this.fb.group({
      nom: ['NomTémoin'],
      prenom: ['PrénomTémoin'],
      telephone: ['00000000', [
        Validators.pattern(/^\d{8}$/)
      ]],
      rue: ['Rue Témoin'],
      ville: ['Ville Témoin'],
      codePostal: [1000, [
        Validators.pattern(/^\d{4}$/),
        Validators.min(1000),
        Validators.max(9999)
      ]],
      pays: ['Tunisie'],
      gouvernat: ['Gouvernorat Témoin'],
      numMaison: ['2']
    });
  }
  
  addTemoin(): void {
    this.temoins.push(this.createTemoinForm());
  }

  removeTemoin(index: number): void {
    
      this.temoins.removeAt(index);
    
  }

  private atLeastOneTemoinValidator(control: AbstractControl): {[key: string]: boolean} | null {
    const temoinsArray = control as FormArray;
    return temoinsArray.length > 0 ? null : { noTemoin: true };
  }

  // Méthode pour convertir les chaînes vides en null
  cleanFormData(): void {
    this.temoins.controls.forEach(control => {
      Object.keys(control.value).forEach(key => {
        if (control.get(key)?.value === '') {
          control.get(key)?.setValue(null);
        }
      });
    });
  }

  
  // Méthodes pour le formulaire
  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      const currentStepValid = this.$validateCurrentStep();
      
      if (currentStepValid) {
        this.steps[this.currentStep].valid = true;
        this.currentStep++;
      } else {
        alert('Veuillez remplir tous les champs obligatoires');
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
  @ViewChild('vehiculeA') vehiculeAComponent!: VehiculeComponent;
  @ViewChild('vehiculeB') vehiculeBComponent!: VehiculeComponent;
  $validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 0:
        return this.generalInfoForm.valid;
      case 1:
        return this.vehiculeAComponent?. vehiculeForm.valid ?? false; // Validation pour véhicule A
      case 2:
        return this.vehiculeBComponent?. vehiculeForm.valid ?? false; // Validation pour véhicule B
      case 3:
        return this.selectedCirconstancesA.length > 0 || this.selectedCirconstancesB.length > 0;
      //case 4:
       // return this.savedSignatures['A'] !== null && this.savedSignatures['B'] !== null;
      default:
        return false;
    }
  }

 
  
 
  
  // Méthodes pour les circonstances
  toggleCirconstance(id: string, vehicle: 'A' | 'B'): void {
    const selectedArray = vehicle === 'A' ? this.selectedCirconstancesA : this.selectedCirconstancesB;
    const index = selectedArray.indexOf(id);
    
    if (index === -1) {
      selectedArray.push(id);
    } else {
      selectedArray.splice(index, 1);
    }
  }

  isSelected(id: string, vehicle: 'A' | 'B'): boolean {
    return vehicle === 'A' 
      ? this.selectedCirconstancesA.includes(id) 
      : this.selectedCirconstancesB.includes(id);
  }

  getSelectedCount(vehicle: 'A' | 'B'): number {
    return vehicle === 'A' 
      ? this.selectedCirconstancesA.length 
      : this.selectedCirconstancesB.length;
  }


onFormSubmitted(formData: any, vehicleType: 'A' | 'B'): void {
  if (vehicleType === 'A') {
    this.vehiculeAData = formData;
    
  } else {
    this.vehiculeBData = formData;
  
  }
}



vehicleImageDataA: string | null = null;
vehicleImageDataB: string | null = null;

vehicleImpactPointsA: ImpactPoint[] = [];
vehicleImpactPointsB: ImpactPoint[] = [];

@ViewChild('vehiculeA') vehiculeA!: VehiculeComponent;
  @ViewChild('vehiculeB') vehiculeB!: VehiculeComponent;
// Update exportFullReport to use the new sketch capture

// Dans appendVehicleComparisonToHTML()
private appendVehicleComparisonToHTML(htmlContent: string, vehicleImageDataUrl: string): string {
  if (!vehicleImageDataUrl) {
    return htmlContent;
  }
  
  const htmlWithoutClosing = htmlContent.replace('</body></html>', '');
  
  const vehicleComparisonHTML = `
    <div class="page-break"></div>
    <div class="vehicle-comparison-section" style="margin-top: 20px;">
      <h2 style="text-align: center; margin-bottom: 15px; color: #2c3e50; font-family: 'Arial', sans-serif;">
        Constats des dommages - Comparaison des véhicules
      </h2>
      
      <div style="text-align: center; margin: 0 auto 20px; max-width: 90%;">
        <img src="${vehicleImageDataUrl}" 
             style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
      </div>
      
      <div style="display: flex; justify-content: space-around; margin-top: 10px;">
        <div style="text-align: center;">
          <span style="display: inline-block; width: 12px; height: 12px; background-color: #0000DC; border-radius: 50%; margin-right: 5px;"></span>
          <span style="color: #0000DC; font-weight: bold;">Véhicule A</span>
        </div>
        <div style="text-align: center;">
          <span style="display: inline-block; width: 12px; height: 12px; background-color: #009600; border-radius: 50%; margin-right: 5px;"></span>
          <span style="color: #009600; font-weight: bold;">Véhicule B</span>
        </div>
      </div>
    </div>
    </body></html>
  `;
  
  return htmlWithoutClosing + vehicleComparisonHTML;
}



  private getCSSStyles(): string {
    return `
      body {
        font-family: Arial, sans-serif;
        font-size: 14px;
        padding: 20px;
        background-color: #f5f5f5;
        color: #333;
      }
  
      .container {
        width: 60%;
        margin: auto;
        background: #fff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
  
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
  
      .header h1 {
        font-size: 18px;
        margin: 0;
        color: #333;
      }
  .page-break {
      page-break-before: always;
    }
    
    .vehicle-comparison-section {
      margin-top: 20px;
    }
    
    .impact-points-container {
      margin-bottom: 15px;
    }
       .impact-point {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: red;
        transform: translate(-50%, -50%);
        z-index: 999;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .avoid-page-break {
        page-break-inside: avoid;
      }
      .page-break {
        page-break-before: always;
      }
      .constat-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        table-layout: fixed;
      }
  
      .constat-header {
        font-weight: bold;
        background-color: #f2f2f2;
        border: 1px solid #000;
      }
  
      .constat-table td {
        border: 1px solid #000;
        padding: 8px;
        vertical-align: top;
      }
  
      .underline {
        border-bottom: 1px solid #000;
        display: inline-block;
        min-width: 80px;
        height: 16px;
        margin-left: 5px;
      }
  
      .checkbox-container {
        display: flex;
        align-items: center;
        margin-top: 5px;
      }
  
      .checkbox {
        border: 1px solid #000;
        width: 12px;
        height: 12px;
        margin-right: 5px;
        display: inline-block;
      }
  
      .divided-cell {
        display: flex;
        height: 100%;
      }
  
      .cell-part {
        flex: 1;
        padding: 0 5px;
      }
  
      .dotted-divider {
        border-right: 2px dotted #000;
      }
  
      .main-container {
        display: flex;
        justify-content: space-between;
        margin: 20px 0;
      }
  
      .vehicle-section {
        width: 34%;
        padding: 10px;
        border: 1px solid #000;
        border-radius: 3px;
      }
  
      .vehicle-section h2 {
        text-align: center;
        font-size: 14px;
        margin-top: 0;
        padding-bottom: 5px;
        border-bottom: 1px solid #000;
      }
  
      .vehicle-section h3 {
        font-size: 12px;
        margin: 10px 0 5px 0;
      }
  
      .circumstances {
        width: 38%;
        padding: 10px;
        border: 1px solid #000;
        border-radius: 3px;
      }
  
      .circumstances h2 {
        text-align: center;
        font-size: 14px;
        margin-top: 0;
        padding-bottom: 5px;
        border-bottom: 1px solid #000;
      }
  
      .circumstance-instructions {
        font-size: 11px;
        text-align: center;
        margin-bottom: 10px;
        font-style: italic;
      }
  
      .circumstance-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
  
      .circumstance-item {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
      }
  
      .vehicle-labels {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-weight: bold;
      }
  
      .signature-section {
        display: flex;
        justify-content: space-between;
        margin-top: 40px;
      }
  
      .signature-box {
        width: 45%;
        text-align: center;
      }
  
      .signature-line {
        border-bottom: 1px solid #000;
        height: 30px;
        margin-top: 5px;
      }
  
      .sketch-img {
        width: 100%;
        height: auto;
        max-height: 400px;
        object-fit: contain;
        border: 1px solid #ddd;
      }
  
      .section {
        margin-bottom: 30px;
      }
  
      .section-title {
        font-weight: bold;
        margin-bottom: 10px;
        border-bottom: 1px solid #000;
      }
  
      .observation-content {
        min-height: 100px;
        border: 1px dashed #ccc;
        padding: 10px;
      }
  
      .section_degat {
        width: 20%;
        padding: 10px;
        border: 1px solid #000;
        border-radius: 3px;
        margin-bottom: 20px;
      }
  
      .filled-field {
        color: red;
        font-weight: bold;
      }
  
      @media print {
        body {
          padding: 10px;
        }
  
        .vehicle-section,
        .circumstances {
          page-break-inside: avoid;
        }
      }
    `;
  }
  
  private generateHeader(): string {
    return `
      <div class="header">
        <h1>CONSTAT AMIABLE D'ACCIDENT</h1>
      </div>`;
  }
  
  private generateGeneralInfoTable(generalInfo: any, temoinsList: any[], generateTemoinHTML: Function): string {
    return `
      <table class="constat-table">
        <tr class="constat-header">
          <td width="40%">
            <div class="divided-cell">
              <div class="cell-part dotted-divider">
                <strong>1. Date de l'accident</strong><br>
                <span class="filled-field">${generalInfo.dateAccident || ''}</span>
              </div>
              <div class="cell-part">
                <strong>Heure</strong><br>
                <span class="filled-field">${generalInfo.heureAccident || ''}</span>
              </div>
            </div>
          </td>
          <td width="30%">
            <strong>2. Lieu</strong><br>
            <span class="filled-field">${generalInfo.rue || ''}, ${generalInfo.codePostal || ''} ${generalInfo.ville || ''}</span>
          </td>
          <td width="30%">
            <strong>3. Blessés même légers</strong>
            <div class="checkbox-container">
              <span class="checkbox">${!generalInfo.blesses ? '✓' : ''}</span> non
              <span class="checkbox">${generalInfo.blesses ? '✓' : ''}</span> oui
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <strong>4. Dégats matériels autres qu'aux véhicules A et B</strong>
            <div class="checkbox-container">
              <span class="checkbox">${!generalInfo.degatsMateriels ? '✓' : ''}</span> non
              <span class="checkbox">${generalInfo.degatsMateriels ? '✓' : ''}</span> oui
            </div>
          </td>
          <td colspan="2">
            <strong>5. Témoins</strong><br>
            ${temoinsList.length > 0 ? 
              temoinsList.map((temoin, index) => generateTemoinHTML(temoin, index)).join('') : 
              '<span class="filled-field">Aucun témoin déclaré</span>'
            }
          </td>
        </tr>
      </table>`;
  }
  
  private generateVehicleSections(vehiculeAData: any, vehiculeBData: any): string {
    return `
      <div class="main-container">
        ${this.generateVehicleSection('A', vehiculeAData)}
        ${this.generateCircumstancesSection()}
        ${this.generateVehicleSection('B', vehiculeBData)}
      </div>`;
  }
  
  private generateVehicleSection(vehicleLetter: string, vehicleData: any): string {
    const bgColor = vehicleLetter === 'A' ? '#d4edda' : '#fff3cd'; // vert clair ou jaune clair
    const borderColor = vehicleLetter === 'A' ? '#155724' : '#856404'; // vert foncé ou jaune foncé
  
    return `
      <div class="vehicle-section" style="background-color: ${bgColor}; border: 2px solid ${borderColor}; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h2>VÉHICULE ${vehicleLetter}</h2>
        
        <h3>6. Société d'Assurances</h3>
        <p>Véhicule assuré par <span class="underline filled-field">${vehicleData.vehiculeAssure || ''}</span></p>
        <p>Contrat N° <span class="underline filled-field" style="min-width: 60%;">${vehicleData.contratAssurance || ''}</span></p>
        <p>Agence <span class="underline filled-field" style="min-width: 70%;">${vehicleData.agence || ''}</span></p>
        <p>Attestation valable <span class="underline filled-field" style="min-width: 70%;">${vehicleData.dateDebut || ''} - ${vehicleData.dateFin || ''}</span></p>
  
        <h3>7. Identité du Conducteur</h3>
        <p>Nom <span class="underline filled-field" style="min-width: 70%;">${vehicleData.nomConducteur || vehicleData.nomAssure || ''}</span></p>
        <p>Prénom <span class="underline filled-field" style="min-width: 70%;">${vehicleData.prenomConducteur || vehicleData.prenomAssure || ''}</span></p>
        <p>Adresse <span class="underline filled-field" style="min-width: 80%;">${vehicleData.rueConducteur || ''}, ${vehicleData.codePostalConducteur || ''} ${vehicleData.villeConducteur || ''}</span></p>
        <p>Permis de conduire n° <span class="underline filled-field" style="min-width: 60%;">${vehicleData.numPermis || ''}</span></p>
        <p>Délivré le <span class="underline filled-field" style="min-width: 60%;">${vehicleData.dateDelivrance || ''}</span></p>
  
        <h3>8. Assuré (voir attestation d'assurance)</h3>
        <p>Nom <span class="underline filled-field" style="min-width: 70%;">${vehicleData.nomAssure || ''}</span></p>
        <p>Prénom <span class="underline filled-field" style="min-width: 70%;">${vehicleData.prenomAssure || ''}</span></p>
        <p>Adresse <span class="underline filled-field" style="min-width: 80%;">${vehicleData.rueAssure || ''}, ${vehicleData.codePostalAssure || ''} ${vehicleData.villeAssure || ''}</span></p>
        <p>Téléphone <span class="underline filled-field" style="min-width: 60%;">${vehicleData.telAssure || ''}</span></p>
  
        <h3>9. Identité du véhicule</h3>
        <p>Marque, Type <span class="underline filled-field" style="min-width: 70%;">${vehicleData.marqueVehicule || ''} ${vehicleData.modeleVehicule || ''}</span></p>
        <p>N° d'immatriculation <span class="underline filled-field" style="min-width: 70%;">${vehicleData.numImmatriculation || ''}</span></p>
        <p>Sens suivi <span class="underline filled-field" style="min-width: 80%;">${vehicleData.venantDe || ''} vers ${this.vehiculeAData.allantA || ''}</span></p>
      </div>`;
  }
  
  private generateCircumstancesSection(): string {
    return `
      <div class="circumstances" style="width: 34%; max-width: 600px; margin: 0 auto;">
        <h2 style="text-align: center; margin-bottom: 10px; font-size: 16px;">12. Circonstances</h2>
        <p style="text-align: center; font-style: italic; margin-bottom: 15px; font-size: 12px;">
          Mettre une croix (x) dans les cases correspondantes pour chaque véhicule
        </p>
  
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <div style="width: 48%; text-align: left; font-weight: bold;">Véhicule A (${this.getSelectedCount('A')})</div>
          <div style="width: 48%; text-align: right; font-weight: bold;">Véhicule B (${this.getSelectedCount('B')})</div>
        </div>
  
        <div style="border: 1px solid #ddd; padding: 10px;">
          ${this.circonstancesOptions.map(option => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
              <div style="width: 85%; display: flex; align-items: center;">
                <span style="border: 1px solid #000; width: 14px; height: 14px; margin-right: 8px;
                      display: inline-flex; justify-content: center; align-items: center; color: red;">
                  ${this.isSelected(option.id, 'A') ? '✗' : ''}
                </span>
                <span>${option.id}. ${option.label}</span>
              </div>
              <div style="width: 10%; text-align: right;">
                <span style="border: 1px solid #000; width: 14px; height: 14px;
                      display: inline-flex; justify-content: center; align-items: center; color: red;">
                  ${this.isSelected(option.id, 'B') ? '✗' : ''}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  

  photosFiles: File[] = [];



 

  isDragging = false;
  private previewUrls: string[] = [];

  async submitConstat(): Promise<void> {
    try {
      const generalData = this.generalInfoForm.value;
      const temoinsData = this.temoins.value;
  
      // Conversion de la date
      const dateAccident = new Date(generalData.dateAccident);
      if (isNaN(dateAccident.getTime())) {
        throw new Error('Format de date invalide');
      }
  
      // Création du payload
      const constatPayload = {
        dateAccident: dateAccident.toISOString(),
        heure: generalData.heureAccident,
        lieu: {
          rue: generalData.rue,
          ville: generalData.ville,
          gouvernat: generalData.gouvernat,
          codePostal: generalData.codePostal,
          pays: 'Tunisia'
        },
        blessees: generalData.blesses,
        degatMateriels: generalData.degatsMateriels,
        temoins: temoinsData.map((t: any) => ({
          nom: t.nom,
          prenom: t.prenom,
          telephone: t.telephone,
          adresse: {
            rue: t.rueTemoin,
            ville: t.villeTemoin,
            gouvernat: t.gouvernat,
            codePostal: t.codePostalTemoin,
            pays: 'Tunisia'
          }
        })),
        conducteur: !this.vehiculeAData.isAssureConducteur ? {
          nom: this.vehiculeAData.nomConducteur,
          prenom: this.vehiculeAData.prenomConducteur,
          numPermis: this.vehiculeAData.numPermis,
          adresse: {
            rue: this.vehiculeAData.rueConducteur,
            ville: this.vehiculeAData.villeConducteur,
            gouvernat: this.vehiculeAData.gouvernatConducteur,
            codePostal: this.vehiculeAData.codePostalConducteur,
            pays: 'Tunisia'
          }
        } : undefined
      };
  
      // Création du FormData unique
      const formData = new FormData();
  
      // Ajout des photos
      this.photosFiles.forEach(file => {
        formData.append('photos', file);
      });
  
      // Ajout du DTO
      formData.append('constatDto', JSON.stringify(constatPayload));
  
      // Ajout des emails
      const getEmail = (vehicule: any) => 
        vehicule.isAssureConducteur 
          ? vehicule.emailAssure 
          : vehicule.emailConducteur;
  
      formData.append('conducteur1Email', getEmail(this.vehiculeAData));
      if (this.vehiculeBData) {
        formData.append('conducteur2Email', getEmail(this.vehiculeBData));
      }
  
      // Appel API
      this.constatService.createConstat(
        this.vehiculeAData.numImmatriculation,
        formData
      ).subscribe({
        next: async (res) => {
          console.log('✅ Constat créé:', res);
          
          // Upload du PDF après création
          const pdfBlob = await this.exportFullReport();
          if (res.idConstat) {
            this.constatService.uploadConstatPDF(res.idConstat, pdfBlob)
              .subscribe(() => {
                console.log('📄 PDF uploadé');
                // If you need to update the UI after PDF upload, use detectChanges
                
              });
          }
        },
        error: (err) => console.error('❌ Erreur:', err)
      });
  
    } catch (error) {
      console.error('⚠️ Erreur:', error);
      // Gestion des erreurs UI
    }
  }

  // Gestion du drag & drop
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  // Sélection de fichiers
  onPhotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFiles(input.files);
    }
  }

  private handleFiles(files: FileList) {
    const newFiles = Array.from(files);
    
    // Validation du nombre de fichiers
    if (this.photosFiles.length + newFiles.length > 5) {
      alert('Maximum 5 photos autorisées');
      return;
    }

    // Validation de la taille et du type
    const validFiles = newFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Le fichier ${file.name} dépasse 5MB`);
        return false;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert(`Format non supporté pour ${file.name}`);
        return false;
      }
      return true;
    });

    this.photosFiles = [...this.photosFiles, ...validFiles];
  }

  // Prévisualisation des images
  getPreview(file: File): string {
    const url = URL.createObjectURL(file);
    this.previewUrls.push(url);
    return url;
  }

  // Gestion des photos
  removePhoto(index: number) {
    this.photosFiles.splice(index, 1);
  }

  clearAllPhotos() {
    this.photosFiles = [];
    this.cleanupPreviews();
  }

  // Visualisation en plein écran
  openFullscreen(file: File) {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // Nettoyage des URLs
  private cleanupPreviews() {
    this.previewUrls.forEach(url => URL.revokeObjectURL(url));
    this.previewUrls = [];
  }

  ngOnDestroy() {
    this.cleanupPreviews();
  }
  // Créer un FormGroup pour un point d'impact

  

  // Définir le type de véhicule actif
  

  
  


  
  

 
 
  
  async exportFullReport(): Promise<Blob> {
    try {
      // Récupération des données de formulaire
      const generalInfo = this.generalInfoForm?.value || {};
      const temoinsList = this.temoins?.value || [];
      const vehiculeAData = this.vehiculeAData || {};
      const vehiculeBData = this.vehiculeBData || {};
      
      // Génération du HTML pour les témoins
      const generateTemoinHTML = (temoin: any, index: number) => {
        console.log("Données des témoins:", this.temoins.value);
        
        // Vérification approfondie des données
        const nom = temoin?.nom || 'Non renseigné';
        const prenom = temoin?.prenom || '';
        const telephone = temoin?.telephone ? `Tel: ${temoin.telephone}` : 'Tel: Non renseigné';
        
        // Construction de l'adresse
        const adresseParts = [
          temoin?.rueTemoin,
          temoin?.codePostalTemoin,
          temoin?.villeTemoin
        ].filter(part => part && part.trim() !== '');
        
        const adresse = adresseParts.length > 0
          ? adresseParts.join(', ')
          : 'Adresse non renseignée';
        
        return `
          <div class="temoin-block" style="margin-bottom: 10px;">
            <strong>Témoin #${index + 1}</strong><br>
            <span class="filled-field">${nom} ${prenom}</span><br>
            <span class="filled-field">${adresse}</span><br>
            <span class="filled-field">${telephone}</span>
          </div>
        `;
      };
      
      // Capturer l'image de comparaison des véhicules avant de générer le HTML principal
     
      
      // Générer le HTML en incluant l'image de comparaison dans le contenu principal
      const finalHtmlContent = this.generateHTMLContent({
        generalInfo,
        temoinsList,
        vehiculeAData,
        vehiculeBData,
        generateTemoinHTML,
      });
      
  const pdfOptions = {
  margin: 10,
  filename: 'constat-amiable.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: {
    scale: 2,
    scrollY: 0,
    useCORS: true,
    allowTaint: true,
    logging: true // Activer le logging pour déboguer
  },
  jsPDF: {
    unit: 'mm',
    format: [240,400], // [width, height] (A4 standard: [210, 297])
    orientation: 'portrait',
    compress: true
  },
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
};

// Effectuer une pause avant l'export pour s'assurer que tout est rendu
await new Promise(resolve => setTimeout(resolve, 500));

// Générer le PDF
const pdfBlob = await html2pdf()
  .set(pdfOptions)
  .from(finalHtmlContent)
  .outputPdf('blob');

return pdfBlob;

} catch (error) {
console.error('Erreur lors de la génération du rapport:', error);
throw error;
}
}
 
  
  
  // Méthode pour générer le contenu HTML
  private generateHTMLContent(data: {
    generalInfo: any;
    temoinsList: any[];
    vehiculeAData: any;
    vehiculeBData: any;
    generateTemoinHTML: (temoin: any, index: number) => string;
  }): string {
    const { 
      generalInfo, 
      temoinsList, 
      vehiculeAData, 
      vehiculeBData, 
      generateTemoinHTML,
     
    } = data;
  
    // Créer la section de comparaison des véhicules intégrée au flux principal
    
  
    return `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Constat Amiable d'Accident</title>
        <style>
          ${this.getCSSStyles()}
          .section {
            margin-bottom: 20px;
          }
          .avoid-page-break {
            page-break-inside: avoid;
          }
          .vehicle-comparison-section {
            margin-top: 10px;
            max-height: 300px;
          }
        </style>
      </head>
      <body>
        <div class="avoid-page-break">
          ${this.generateHeader()}
        </div>
        <div class="avoid-page-break">
          ${this.generateGeneralInfoTable(generalInfo, temoinsList, generateTemoinHTML)}
        </div>
        <div class="avoid-page-break">
          ${this.generateVehicleSections(vehiculeAData, vehiculeBData)}
        </div>
       
      </body>
      </html>`;
  }
 
}