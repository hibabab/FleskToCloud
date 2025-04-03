import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-renouvellement-ca',
  standalone: false,
  templateUrl: './renouvellement-ca.component.html',
  styleUrl: './renouvellement-ca.component.css'
})
export class RenouvellementCAComponent {
  renewalForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.renewalForm = this.fb.group({
      Cin: ['', Validators.required],
      Imat: ['', Validators.required]
    });
  }

  onSubmit() {
    if (!this.renewalForm.get('Cin')?.value || !this.renewalForm.get('Imat')?.value) {
    window.alert('Le CIN et l\'immatriculation sont requis pour le renouvellement');
    return;
}

const requestData = {
    Cin: this.renewalForm.get('Cin')?.value,
    Imat: this.renewalForm.get('Imat')?.value
};

this.isLoading = true;

this.http.post<{success: boolean, data: any, message: string}>(
    'http://localhost:3000/contrat-auto-geteway/renouveler-contrat',
    requestData
).subscribe({
    next: async (response) => {
        this.isLoading = false;

        if (response.success) {
            console.log('Contrat renouvelé:', response.data);
            await this.generateContratPDF(response.data);



            console.log('Contrat renouvelé avec succès');

        } else {
            console.error('Réponse inattendue:', response);
            window.alert(response.message || 'Erreur lors du renouvellement');
        }
    },
    error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Erreur:', err);

        let errorMessage = 'Erreur lors du renouvellement du contrat';
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
          contratData.contrat.num || 'N/A',
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



