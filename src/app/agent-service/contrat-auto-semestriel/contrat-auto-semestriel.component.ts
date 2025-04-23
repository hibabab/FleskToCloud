import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-contrat-auto-semestriel',
  templateUrl: './contrat-auto-semestriel.component.html',
  standalone:false,
  styleUrls: ['./contrat-auto-semestriel.component.css']
})
export class ContratAutoSemestrielComponent {
  num!: number;
  isLoading: boolean = false;
  errorMessage = '';
  successMessage = '';
  constructor(private http: HttpClient) {}

  onSubmit() {
    if (!this.num) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.http.patch<any>(
      `http://localhost:3000/contrat-auto-geteway/update-echeances/${this.num}`,
      {}
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          const contratNum = response.data?.contrat?.id
            || response.data?.contrat?.num
            || response.data?.id
            || this.num;
          this.successMessage = response.message || 'Opération réussie';
          this.processPayment(contratNum, response.data);
        } else {
          this.errorMessage = response.message || 'Erreur lors du traitement';
          console.log(this.errorMessage);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.message || 'Erreur serveur';
        console.log(this.errorMessage);
      }
    });
  }
   private processPayment(contratNum: number, contractData: any) {
      // Appel à l'API pour créer un paiement local
      this.generateContratPDF(contractData);
      this.http.post<{success: boolean, data: any, message: string}>(
        'http://localhost:3000/payments/local',
        { contratNum: contratNum },
        { headers: { 'Content-Type': 'application/json' } }
      ).subscribe({
        next: (paymentResponse) => {
          this.isLoading = false;

          if (paymentResponse.success) {
            console.log('Paiement local enregistré:', paymentResponse.data);
            this.successMessage = 'Contrat renouvelé et paiement enregistré avec succès';




            // Génération du reçu de paiement
            this.generatePaymentReceipt({
              paymentId: paymentResponse.data.paymentId,
              status: paymentResponse.data.status,
              amount: paymentResponse.data.amount,
              paymentDate: paymentResponse.data.paymentDate,
              contrat: {
                num: contratNum
              }
            });
          } else {
            console.error('Réponse paiement inattendue:', paymentResponse);
            this.errorMessage = paymentResponse.message || 'Erreur lors de l\'enregistrement du paiement';
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Erreur de paiement:', err);

          let errorMessage = 'Erreur lors de l\'enregistrement du paiement';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          }

          this.errorMessage = errorMessage;
        }
      });
    }
 async generatePaymentReceipt(paymentData: any): Promise<void> {
    try {
      const doc = new jsPDF('p', 'mm', 'a4') as any;
      doc.setFont('helvetica');

      // Variables de position
      let yOffset = 20;
      const margin = 15;
      const lineHeight = 7;
      const sectionSpacing = 5;

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
      doc.text('REÇU DE PAIEMENT', 105, yOffset + 15, { align: 'center' });
      yOffset += 30;

      // 2. Informations du paiement
      doc.setFontSize(10);
      doc.text('INFORMATIONS DE PAIEMENT', margin, yOffset);
      yOffset += lineHeight;

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['Référence Paiement', 'Statut', 'Date Paiement', 'Montant'],
          [
            paymentData.paymentId || 'N/A',
            paymentData.status || 'N/A',
            paymentData.paymentDate ? new Date(paymentData.paymentDate).toLocaleDateString() : 'N/A',
            paymentData.amount ? `${paymentData.amount.toFixed(3)} DT` : '0.000 DT'
          ]
        ],
        styles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { fontStyle: 'bold' },
          2: { fontStyle: 'bold' },
          3: { fontStyle: 'bold' }
        }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 3. Informations du contrat associé
      doc.setFontSize(10);
      doc.text('INFORMATIONS DU CONTRAT', margin, yOffset);
      yOffset += lineHeight;

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['N° Contrat', 'Date', 'Type de paiement'],
          [
            paymentData.contrat?.num || 'N/A',
            new Date().toLocaleDateString(),
            'Paiement en espèces'
          ]
        ],
        styles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { fontStyle: 'bold' },
          2: { fontStyle: 'bold' }
        }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // Pied de page
      doc.setFontSize(6);
      doc.setTextColor(100);
      doc.text('Flesk Cover - Tél: 24051646 - Email: contact@fleskcover.com', 105, 285, { align: 'center' });

      // Génération du fichier
      const fileName = `Reçu_Paiement_${paymentData.paymentId || new Date().getTime()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur génération reçu PDF:', error);
      throw error;
    }
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
      doc.setFontSize(10); // Taille de police réduite
      doc.text('INFORMATIONS DU CONTRAT', margin, yOffset);
      yOffset += lineHeight;

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['N° Contrat','Code agence',  'N° Sociétaire','Date Souscription','Date Effet', 'Date Expiration', 'Nature', 'Échéances'],
          [



            contratData?.contrat?.id ||
          contratData?.contrat?.num ||
          'N/A',

          // Code agence (fixe ou dynamique)
          133,

          // N° Sociétaire - Accès selon la structure de l'API
          contratData?.assure?.numSouscription ||
          'N/A',

          // Dates - Accès selon la structure de l'API avec formatage
          contratData?.contrat?.dateSouscription,
          contratData?.contrat?.dateSouscription, // Date effet = date souscription
        contratData?.contrat?.dateExpiration,

          // Nature contrat - Accès selon la structure de l'API
          contratData?.contrat?.NatureContrat ||
          'Standard',

          // Échéances - Accès selon la structure de l'API
          contratData?.contrat?.echeances ?
          contratData.contrat.echeances :
            'N/A'
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
      doc.setFontSize(10);
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
      doc.setFontSize(10);
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
      doc.setFontSize(10);
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
      doc.setFontSize(10);
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





