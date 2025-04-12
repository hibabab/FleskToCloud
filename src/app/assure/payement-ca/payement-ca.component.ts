import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivatedRoute, Router } from '@angular/router';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp?: string;
}

@Component({
  selector: 'app-payement-ca',
  standalone: false,
  templateUrl: './payement-ca.component.html',
  styleUrl: './payement-ca.component.css'
})
export class PayementCAComponent implements OnInit {
  isLoading = true;
  isSuccess = false;
  errorMessage = '';
  paymentId = '';
  contratNum = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Récupérer les paramètres de l'URL
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['paymentId'] || '';

      // Si un paymentId est présent, vérifier le statut du paiement
      if (this.paymentId) {
        this.verifyPayment(this.paymentId);
      } else {
        this.isLoading = false;
        this.isSuccess = false;
        this.errorMessage = 'Aucun identifiant de paiement trouvé';
      }
    });
  }

  private verifyPayment(paymentId: string): void {
    this.http.get<ApiResponse<any>>(
      `http://localhost:3000/payments/verify/${paymentId}`
    ).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success && response.data?.status === 'PAID') {
          this.isSuccess = true;
          this.contratNum = response.data.contratNum;

          // Afficher le message de succès
          this.showSuccessMessage();

          // Récupérer les détails du contrat et générer le PDF
          this.getContratDetails(this.contratNum);
        } else {
          this.isSuccess = false;
          this.errorMessage = response.message || 'Le paiement a échoué';

          // Afficher le message d'échec
          this.showFailureMessage(this.errorMessage);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la vérification du paiement';
        console.error('Erreur vérification paiement:', err);

        // Afficher le message d'échec
        this.showFailureMessage(this.errorMessage);
      }
    });
  }

  retryPayment(): void {
    // Rediriger vers la page de création de paiement avec le numéro du contrat
    if (this.contratNum) {
      this.router.navigate(['/payment/create'], { queryParams: { contratNum: this.contratNum } });
    } else {
      this.router.navigate(['/dashboard']); // Redirection par défaut
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  private getContratDetails(contratId: number) {
    this.http.get<ApiResponse<any>>(
      `http://localhost:3000/contrat-auto-geteway/contrat/${contratId}`
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.generateContratPDF(response.data);
        } else {
          this.errorMessage = response.message || 'Détails non disponibles';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur serveur';
        console.error('Erreur détails:', err);
      }
    });
  }

  private showSuccessMessage() {
    this.snackBar.open(
      'Paiement effectué avec succès ! Une livraison de la feuille rose sera envoyée à votre adresse dans 24H maximum.',
      'Fermer',
      {
        duration: 8000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['success-snackbar']
      }
    );
  }

  private showFailureMessage(message: string) {
    this.snackBar.open(
      `Échec du paiement : ${message}`,
      'Fermer',
      {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      }
    );
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
      const assure = contratData.assure || {};
      autoTable(doc, {
        startY: yOffset,
        body: [
          ['N° Contrat','Code agence',  'N° Sociétaire','Date Souscription','Date Effet', 'Date Expiration', 'Nature', 'Échéances'],
          [
            contratData.contrat.num || 'N/A',
            133,
            contratData.assure?.NumSouscription || 'N/A',
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
          7: { fontStyle: 'bold' }
        }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 3. Informations du sociétaire avec adresse
      doc.setFontSize(10);
      doc.text('INFORMATIONS SOCIÉTAIRE', margin, yOffset);
      yOffset += lineHeight;

      const user = contratData.assure?.user || {};
      const adresse = user?.adresse || {};

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['Nom', 'Prénom', 'CIN', 'Téléphone', 'Bonus/Malus'],
          [
           user.nom || 'N/A',
           user.prenom || 'N/A',
           user.Cin || 'N/A',
           user.telephone || 'N/A',
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
      doc.setFontSize(8);

      // Signature du sociétaire
      doc.text('Le Sociétaire', margin + 30, signatureY);
      doc.line(margin + 30, signatureY + 2, margin + 70, signatureY + 2);

      // Signature du rédacteur
      const pageWidth = doc.internal.pageSize.width;
      doc.text('Le Rédacteur', pageWidth - margin - 50, signatureY);
      doc.line(pageWidth - margin - 50, signatureY + 2, pageWidth - margin - 20, signatureY + 2);

      // 8. Pied de page
      doc.setFontSize(6);
      doc.setTextColor(100);
      doc.text('Flesk Cover - Tél: 24051646 - Email: contact@fleskcover.com', 105, 285, { align: 'center' });

      // Génération du fichier
      const fileName = `Contrat_Auto_${contratData.contrat.id || new Date().getTime()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur génération PDF:', error);
    }
  }

  private loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = () => {
        if (xhr.status === 200) {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
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
}
