import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { finalize } from 'rxjs/operators';
import { PaymentResponse, PaymentService } from '../services/payment.service';


interface UserDto {
  id: number;
  nom: string;
  prenom: string;
  Cin: string;
  telephone: string;
  email: string;
}



@Component({
  selector: 'app-renouvellement-ca',
  standalone: false,
  templateUrl: './renouvellement-ca.component.html',
  styleUrl: './renouvellement-ca.component.css'
})
export class RenouvellementCAComponent implements OnInit {
  renewalForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  user: UserDto | null = null;
  userCin: string = '';

  // Variables pour la partie paiement
  paymentData: any = null;
  paymentLoading: boolean = false;
  paymentError: string = '';
  contratNum: number | null = null;
  showDebugInfo: boolean = false;

  // URLs pour le retour après paiement
  successUrl: string = 'http://localhost:4200/dashboard-assure/payment/success';
  failUrl: string = 'http://localhost:4200/dashboard-assure/payment/failure';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private paymentService: PaymentService
  ) {
    this.renewalForm = this.fb.group({
      Imat: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserDataFromToken();
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  loadUserDataFromToken(): void {
    const token = this.getCookie('access_token');

    if (!token) {
      this.errorMessage = 'Session invalide. Veuillez vous reconnecter.';
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const userId = Number(decoded.sub);

      if (!userId) {
        this.errorMessage = 'Impossible de récupérer l\'ID utilisateur';
        return;
      }

      this.fetchUserData(userId);
    } catch (error) {
      this.errorMessage = 'Erreur de décodage du token';
      console.error('Erreur de décodage:', error);
    }
  }

  fetchUserData(userId: number): void {
    this.isLoading = true;

    this.http.get<UserDto>(`http://localhost:3000/auth/users/${userId}`).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.user = user;
        this.userCin = user.Cin;
        // Pré-remplir le CIN dans le formulaire
        this.renewalForm.patchValue({ Cin: user.Cin });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la récupération des données utilisateur';
        console.error('Erreur:', err);
      }
    });
  }

  onSubmit() {
    if (this.renewalForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs requis';
      return;
    }

    const requestData = {
      Cin: this.userCin,
      Imat: this.renewalForm.get('Imat')?.value
    };

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post<{success: boolean, data: any, message: string}>(
      'http://localhost:3000/contrat-auto-geteway/renouveler-contrat',
      requestData
    ).subscribe({
      next: async (response) => {
        this.isLoading = false;

        if (response.success) {
          this.successMessage = 'Contrat renouvelé avec succès!';
          await this.generateContratPDF(response.data);
          this.contratNum = response.data.contrat.id;
         this.continuePayment()
        } else {
          this.errorMessage = response.message || 'Erreur lors du renouvellement';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Erreur:', err);

        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Erreur lors du renouvellement du contrat';
        }
      }
    });
  }


  continuePayment(): void {
   if (this.contratNum) {
      this.router.navigate([`/dashboard-assure/contrat/${this.contratNum}/payment`]);
    } else {
      this.errorMessage = 'Impossible de continuer vers le paiement: données manquantes';
    }
  }

  initiatePayment(): void {
    if (!this.contratNum) {
      this.paymentError = 'Numéro de contrat non disponible';
      return;
    }

    this.paymentLoading = true;
    this.paymentError = '';
    this.paymentService.generatePaymentLink(
      this.contratNum,
      this.successUrl,
      this.failUrl
    )
    .pipe(finalize(() => this.paymentLoading = false))
    .subscribe({
      next: (response: PaymentResponse) => {
        if (response.success && response.data) {
          this.paymentData = response.data;
          console.log('Paiement initialisé avec succès:', this.paymentData);
          this.continuePayment();
        } else {
          this.paymentError = response.message || 'Erreur lors de l\'initialisation du paiement';
        }
      },
      error: (err: any) => {
        console.error('Erreur lors de l\'initialisation du paiement:', err);

        // Traitement spécifique selon les codes d'erreur
        if (err.status === 400) {
          if (err.error?.message === 'The amount is not accepted') {
            this.paymentError = 'Le montant de l\'échéance n\'est pas valide. Veuillez contacter le service client.';
          } else if (err.error?.message === 'Un paiement existe déjà pour ce contrat') {
            this.getExistingPayment();
            return;
          } else {
            this.paymentError = err.error?.message || 'Erreur de validation des données';
          }
        } else if (err.status === 404) {
          this.paymentError = 'Contrat non trouvé';
        } else {
          this.paymentError = err.error?.message || 'Erreur de connexion au service de paiement';
        }
      }
    });
  }

  getExistingPayment(): void {
    if (!this.contratNum) return;

    this.paymentService.getPaymentStatus(this.contratNum)
      .pipe(finalize(() => this.paymentLoading = false))
      .subscribe({
        next: (response: PaymentResponse) => {
          if (response.success && response.data) {
            this.paymentData = response.data;

            if (response.data.status === 'PAID') {
              this.paymentError = 'Ce contrat a déjà été payé.';
            } else {
              this.paymentError = 'Un paiement existe déjà pour ce contrat.';
              this.continuePayment(); // Si un paiement existe, proposer de continuer avec ce paiement
            }
          } else {
            this.paymentError = 'Impossible de récupérer les informations de paiement';
          }
        },
        error: (err) => {
          this.paymentError = 'Erreur lors de la récupération du paiement existant';
          console.error('Erreur API:', err);
        }
      });
  }



  cancelAndCreateNewPayment(): void {
    if (!this.contratNum) return;

    this.paymentLoading = true;
    this.paymentError = '';

    this.paymentService.cancelPayment(this.contratNum)
      .pipe(finalize(() => {}))
      .subscribe({
        next: () => {
          console.log('Paiement précédent supprimé avec succès');
          this.initiatePayment();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du paiement:', err);
          this.paymentError = 'Impossible de supprimer le paiement existant';
          this.paymentLoading = false;
        }
      });
  }

  toggleDebugInfo(): void {
    this.showDebugInfo = !this.showDebugInfo;
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
          7: { fontStyle: 'bold' }
        }
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
    }
  }
}
