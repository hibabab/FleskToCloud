import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-devis-avie',
  standalone: false,
  templateUrl: './devis-avie.component.html',
  styleUrl: './devis-avie.component.css'
})
export class DevisAvieComponent {
  devisForm: FormGroup;
  showPdfPreview = false;
  pdfContent = '';
  isDisabled = true;
  constructor(private fb: FormBuilder) {
    this.devisForm = this.fb.group({
      // Informations personnelles
      cin: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{8}$/),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(70)]],

      // Informations sur l'emprunt
      organismePreteur: ['', Validators.required],
      montantPret: ['', [Validators.required, Validators.min(1000)]],
      dureeRemboursement: ['', [Validators.required, Validators.min(1), Validators.max(30)]],

      // Garanties
      garantieDeces: [{ value: true, disabled: this.isDisabled }],

      garantieInvalidite: [false]
    });
  }

  calculerCotisation(): number {
    if (!this.devisForm.valid) return 0;

    const formValue = this.devisForm.value;
    let cotisation = 0;

    // Calcul de base
    if (formValue.montantPret < 10000) {
      cotisation = formValue.montantPret * 0.005;
    } else {
      cotisation = formValue.montantPret * 0.01;
    }

    // Majorations
    if (formValue.age > 50) {
      cotisation += 50;
    }

    if (formValue.dureeRemboursement > 7) {
      cotisation += 100;
    }

    if (formValue.garantieDeces && formValue.garantieInvalidite) {
      cotisation += 30;
    }

    return Math.round(cotisation * 100) / 100; // Arrondi à 2 décimales
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
  async genererDevisPDF() {
    if (this.devisForm.invalid) {
      alert('Veuillez remplir correctement tous les champs obligatoires');
      return;
    }

    const formValue = this.devisForm.value;
    const cotisation = this.calculerCotisation();

    const doc = new jsPDF();

    try {
      // Charger le logo
      const logoBase64 = await this.loadImageAsBase64('assets/images/logoFC.png');

      // Configuration initiale
      doc.setFont('helvetica');
      let yOffset = 20; // Position verticale initiale

      // Ajouter le logo en haut à gauche (50x50 pixels)
      doc.addImage(logoBase64, 'PNG', 10, 3, 50, 50);

      // En-tête du document
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('FLESK COVER', 70, 20);
      doc.setFontSize(12);
      doc.text('Assurance Emprunteur - Devis', 70, 27);

      // Informations client à droite
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 15);
      doc.text(`Client: ${formValue.nom} ${formValue.prenom}`, 150, 22);
      doc.text(`CIN: ${formValue.cin}`, 150, 29);
      doc.text(`Âge: ${formValue.age} ans`, 150, 36);

      // Ligne de séparation
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(10, 45, 200, 45);
      yOffset = 50;

      // Section 1: Informations sur l'emprunt
      doc.setFontSize(14);
      doc.setTextColor(0, 128, 128); // Teal color
      doc.text('INFORMATIONS SUR L\'EMPRUNT', 10, yOffset);
      yOffset += 10;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      autoTable(doc, {
        startY: yOffset,
        head: [['Détail', 'Valeur']],
        body: [
          ['Organisme prêteur', formValue.organismePreteur],
          ['Montant du prêt', `${formValue.montantPret} DT`],
          ['Durée de remboursement', `${formValue.dureeRemboursement} ans`]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [0, 128, 128], // Teal header
          textColor: [255, 255, 255] // White text
        },
        margin: { left: 10 }
      });

      // Section 2: Garanties choisies
      yOffset = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(0, 128, 128);
      doc.text('GARANTIES CHOISIES', 10, yOffset);
      yOffset += 10;

      const garanties = [];
      if (formValue.garantieDeces) garanties.push('Décès');
      if (formValue.garantieInvalidite) garanties.push('Invalidité Absolue et Définitive');

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      autoTable(doc, {
        startY: yOffset,
        head: [['Type de garantie', 'Statut']],
        body: garanties.map(g => [g, 'Incluse']),
        theme: 'grid',
        headStyles: {
          fillColor: [0, 128, 128],
          textColor: [255, 255, 255]
        },
        margin: { left: 10 }
      });

      // Section 3: Détails du calcul
      yOffset = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(0, 128, 128);
      doc.text('DÉTAILS DU CALCUL', 10, yOffset);
      yOffset += 10;

      const calculDetails = [];
      const baseRate = formValue.montantPret < 10000 ? 0.005 : 0.01;
      calculDetails.push([
        `Taux de base (${formValue.montantPret < 10000 ? '0.5%' : '1%'})`,
        `${(formValue.montantPret * baseRate).toFixed(2)} DT`
      ]);

      if (formValue.age > 50) calculDetails.push(['Majoration >50 ans', '+50.00 DT']);
      if (formValue.dureeRemboursement > 7) calculDetails.push(['Majoration durée >7 ans', '+100.00 DT']);
      if (formValue.garantieDeces && formValue.garantieInvalidite) calculDetails.push(['Majoration double garantie', '+30.00 DT']);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      autoTable(doc, {
        startY: yOffset,
        head: [['Libellé', 'Montant']],
        body: calculDetails,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 128, 128],
          textColor: [255, 255, 255]
        },
        margin: { left: 10 }
      });

      // Section 4: Total
      yOffset = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(0, 128, 128);
      doc.text('TOTAL', 10, yOffset);
      yOffset += 10;

      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`COTISATION TOTALE: ${cotisation.toFixed(2)} DT`, 10, yOffset);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      // Pied de page
      yOffset += 20;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('FLESK COVER - Votre partenaire assurance', 10, yOffset);
      doc.text('Email: contact@fleskcover.com | Tél: 24051646', 10, yOffset + 5);
      doc.text('Adresse: Rue de l\'assurance, Tunis', 10, yOffset + 10);

      // Enregistrer le PDF
      doc.save(`Devis_FleskCover_${formValue.nom}_${formValue.prenom}.pdf`);

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur est survenue lors de la génération du devis');
    }
  }



  telechargerDevis() {
    const blob = new Blob([this.pdfContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `devis-assurance-vie-${this.devisForm.value.nom}-${this.devisForm.value.prenom}.txt`);

  }
}
