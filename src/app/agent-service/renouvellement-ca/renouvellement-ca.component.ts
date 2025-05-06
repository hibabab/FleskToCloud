import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PaymentService } from '../../assure/services/payment.service';
import { finalize } from 'rxjs';

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
  loading = false;
  error: string | null = null;
  contractData: any = null;
  contratNum: number | null = null;
  showRenewalForm = false;
  isExpired = false;
  isNearExpiration = false;
  expirationMessage = '';
  isRenewable: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private paymentService: PaymentService) {
    this.renewalForm = this.fb.group({
      Cin: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      Imat: ['', [Validators.required,this.validateImmatriculation]],
      packOption: ['same', Validators.required],
      packValue: ['same']  // Default value aligned with backend
    });

    // Update packValue based on packOption selection
    this.renewalForm.get('packOption')?.valueChanges.subscribe(option => {
      const packValueControl = this.renewalForm.get('packValue');

      if (option === 'same') {
        packValueControl?.setValue('same');
        packValueControl?.clearValidators();
      } else if (option === 'change') {
        packValueControl?.setValue(''); // Clear the value when changing
        packValueControl?.setValidators(Validators.required);
      }

      packValueControl?.updateValueAndValidity();
    });
  }
  searchContract() {this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.contractData = null;
    this.isExpired = false;
    this.expirationMessage = '';
    const Cin = this.renewalForm.get('Cin')?.value;
    const Imat = this.renewalForm.get('Imat')?.value;
    // Appel à l'API pour récupérer les détails du contrat
    this.http.get<any>(
      `http://localhost:3000/contrat-auto-geteway/search?Cin=${Cin}&Imat=${Imat}`
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.status === 200 && response.data && response.data.length > 0) {
          this.contractData = response.data[0];
          this.contratNum = this.contractData.id;
          this.checkExpirationDate();


        } else {
          this.errorMessage = 'Aucun contrat trouvé pour les informations fournies';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Erreur:', err);
        let errorMessage = 'Erreur lors de la recherche du contrat';
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        this.errorMessage = errorMessage;
      }
    });}
    checkExpirationDate() {
      if (!this.contractData?.dateExpiration) {
        this.errorMessage = 'Impossible de vérifier la date d\'expiration: informations manquantes';
        return;
      }

      const today = new Date();
      // Réinitialiser l'heure à 00:00:00 pour éviter les problèmes de comparaison
      today.setHours(0, 0, 0, 0);

      const expirationDate = new Date(this.contractData.dateExpiration);
      // Réinitialiser l'heure pour la date d'expiration également
      expirationDate.setHours(0, 0, 0, 0);

      const warningDate = new Date(expirationDate);
      warningDate.setDate(warningDate.getDate() - 14);

      // Débogage - afficher les dates pour vérification
      console.log('Today:', today);
      console.log('Expiration date:', expirationDate);
      console.log('Warning date:', warningDate);

      // Logique pour déterminer l'état du contrat
      this.isExpired = today > expirationDate; // Vrai si date dépassée (strictement supérieur)
      this.isNearExpiration = today >= warningDate && today <= expirationDate; // Période d'alerte, inclut la date d'expiration

      // Un contrat est renouvelable si aujourd'hui est égal à la date d'expiration ou dans les 14 jours avant
      this.isRenewable = today.getTime() === expirationDate.getTime() ||
                        (today >= warningDate && today <= expirationDate);

      console.log('isExpired:', this.isExpired);
      console.log('isNearExpiration:', this.isNearExpiration);
      console.log('isRenewable:', this.isRenewable);

      const remainingDays = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      console.log('Jours restants:', remainingDays);

      if (this.isExpired) {
        this.expirationMessage = 'Votre contrat est expiré. Veuillez le renouveler.';
      } else if (this.isNearExpiration) {
        this.expirationMessage = `Attention : Votre contrat expire dans ${remainingDays} jours.`;
      } else {
        this.expirationMessage = `Valide jusqu'au ${expirationDate.toLocaleDateString()} (${remainingDays} jours restants).`;
      }

      // Afficher le formulaire uniquement si le contrat est renouvelable
      this.showRenewalForm = this.isRenewable;
    }
    async onSubmit() {
      if (!this.renewalForm.valid) {
        this.markFormGroupTouched(this.renewalForm);
        window.alert('Veuillez remplir tous les champs requis');
        return;
      }

      // Recherche du contrat et attente de la fin de l'opération
      await new Promise<void>((resolve) => {
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
        this.contractData = null;
        this.isExpired = false;
        this.expirationMessage = '';

        const Cin = this.renewalForm.get('Cin')?.value;
        const Imat = this.renewalForm.get('Imat')?.value;

        this.http.get<any>(
          `http://localhost:3000/contrat-auto-geteway/search?Cin=${Cin}&Imat=${Imat}`
        ).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response && response.status === 200 && response.data && response.data.length > 0) {
              this.contractData = response.data[0];
              this.contratNum = this.contractData.id;
              this.checkExpirationDate();
              resolve();
            } else {
              this.errorMessage = 'Aucun contrat trouvé pour les informations fournies';
              resolve();
            }
          },
          error: (err: HttpErrorResponse) => {
            this.isLoading = false;
            console.error('Erreur:', err);
            let errorMessage = 'Erreur lors de la recherche du contrat';
            if (err.error?.message) {
              errorMessage = err.error.message;
            } else if (err.message) {
              errorMessage = err.message;
            }
            this.errorMessage = errorMessage;
            resolve();
          }
        });
      });

      console.log("dans onsubmit", this.isRenewable);

      // Maintenant que isRenewable est correctement défini, on peut vérifier
      if (!this.isRenewable) {
        this.errorMessage = 'Le renouvellement n\'est autorisé que pour les contrats dont la date d\'expiration est aujourd\'hui ou dans les 14 prochains jours.';
        return;
      }

      // Map the form values to match the backend expectations
      let packChoice: 'same' | 'Pack1' | 'Pack2' | 'Pack3';

      if (this.renewalForm.get('packOption')?.value === 'same') {
        packChoice = 'same';
      } else {
        // Map the selected pack to the backend expected values
        switch (this.renewalForm.get('packValue')?.value) {
          case 'essentiel':
            packChoice = 'Pack1';
            break;
          case 'dommage':
            packChoice = 'Pack2';
            break;
          case 'tierce':
            packChoice = 'Pack3';
            break;
          default:
            packChoice = 'same';
        }
      }

      const requestData = {
        Cin: this.renewalForm.get('Cin')?.value,
        Imat: this.renewalForm.get('Imat')?.value,
        packChoice: packChoice
      };

      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.http.post<{success: boolean, data: any, message: string}>(
        'http://localhost:3000/contrat-auto-geteway/renouveler-contrat',
        requestData
      ).subscribe({
        next: async (response) => {
          if (response.success) {
            console.log('Contrat renouvelé:', response.data);
            // Get contract number from response
            const contratNum = response.data.contrat.id;

            // Supprimer l'ancien paiement et créer un nouveau
            this.cancelAndCreateNewPayment(contratNum, response.data);
          } else {
            this.isLoading = false;
            console.error('Réponse inattendue:', response);
            this.errorMessage = response.message || 'Erreur lors du renouvellement';
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

          this.errorMessage = errorMessage;
        }
      });
    }

  // Méthode pour annuler l'ancien paiement et en créer un nouveau
  cancelAndCreateNewPayment(contratNum: number, contractData: any): void {
    this.loading = true;
    this.error = null;

    // Stocker les données du contrat pour utilisation ultérieure
    this.contractData = contractData;
    this.contratNum = contratNum;
console.log(contratNum);
    this.paymentService.cancel(contratNum)
      .pipe(finalize(() => {
        console.log('Finalisation de la demande d\'annulation');
      }))
      .subscribe({
        next: (response) => {
          console.log('Paiement précédent annulé avec succès:', response);
          setTimeout(() => {
            this.processPayment(contratNum, contractData);
            const updateUrl = `http://localhost:3000/contrat-auto-geteway/contrat/${contratNum}/status`;

            // Mettre à jour le statut du contrat via HTTP
            const updateResponse: any = this.http.patch(updateUrl, {
              status: 'valide'
            }).toPromise();

            if (updateResponse && updateResponse.success) {
              console.log('Statut du contrat mis à jour avec succès');}
          }, 1000);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du paiement:', err);
          if (err.status === 404) {
            console.log('Aucun paiement à annuler, tentative de création directe');
            this.processPayment(contratNum, contractData);
          } else {
            this.error = err.error?.message || 'Impossible de supprimer le paiement existant';
            this.loading = false;
            this.isLoading = false;
          }
        }
      });
  }

  private processPayment(contratNum: number, contractData: any) {
    // Appel à l'API pour créer un paiement local
    this.http.post<{success: boolean, data: any, message: string}>(
      'http://localhost:3000/payments/local',
      { contratNum: contratNum },
      { headers: { 'Content-Type': 'application/json' } }
    ).subscribe({
      next: (paymentResponse) => {
        this.isLoading = false;
        this.loading = false;

        if (paymentResponse.success) {
          console.log('Paiement local enregistré:', paymentResponse.data);
          this.successMessage = 'Contrat renouvelé et paiement enregistré avec succès';

          // Génération du PDF du contrat
          this.generateContratPDF(contractData);

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
        this.loading = false;
        console.error('Erreur de paiement:', err);

        let errorMessage = 'Erreur lors de l\'enregistrement du paiement';
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.errorMessage = errorMessage;

        // Still generate contract PDF even if payment fails
        this.generateContratPDF(contractData);
      }
    });
  }
    validateImmatriculation(control: AbstractControl): {[key: string]: any} | null {
        const pattern = /^\d{1,4}TU\d{1,3}$/i;

        if (control.value && !pattern.test(control.value)) {
          return { 'invalidImmatriculation': true };
        }
        return null;
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
  // Assuming this method exists in your component
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
          ['N° Contrat','Code agence',  'N° Sociétaire','Date Souscription','Date Effet', 'Date Expiration'],
          [
            contratData.contrat.id || 'N/A',
            133,
            contratData.assure?.numSouscription || 'N/A',
            contratData.contrat.dateSouscription || 'N/A',
            contratData.contrat.dateEffet || 'N/A',
            contratData.contrat.dateExpiration || 'N/A',

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
          ['Rue', 'Numéro de maison','Ville', 'Gouvernat','Code Postal', ''],
          [
            adresse.rue || 'N/A',
            adresse.numMaison || 'N/A',
            adresse.ville || 'N/A',
            adresse.gouvernat || 'N/A',
            adresse.codePostal || 'N/A',
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
          ['Cotisation Nette', 'Cotisation Totale', ],
          [
            contratData.contrat.cotisationNette ? `${contratData.contrat.cotisationNette.toFixed(3)} DT` : '0.000 DT',
            contratData.contrat.cotisationTotale ? `${contratData.contrat.cotisationTotale.toFixed(3)} DT` : '0.000 DT',

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

      // 7. Informations sur le pack
      const packInfoY = (doc as any).lastAutoTable.finalY + sectionSpacing;
      doc.setFontSize(12);
      doc.text('INFORMATIONS SUR LE PACK', margin, packInfoY);
      yOffset = packInfoY + lineHeight;

      // Déterminer le nom du pack
      let packName = "Pack actuel conservé";
      if (this.renewalForm.get('packOption')?.value === 'change') {
        const packValue = this.renewalForm.get('packChoisi')?.value;
        if (packValue === 'essentiel') packName = "Pack Essentiel";
        else if (packValue === 'dommage') packName = "Pack Dommage et Collision";
        else if (packValue === 'tierce') packName = "Pack Tierce";
      }

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['Pack choisi pour le renouvellement'],
          [packName]
        ],
        styles: {
          fontSize: 8
        },
        columnStyles: {
          0: { fontStyle: 'bold' }
        }
      });

      // 8. Signatures - position ajustée
      const signatureY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(10);

      // Signature du sociétaire
      doc.text('Le Sociétaire', margin + 20, signatureY);
      doc.line(margin + 20, signatureY + 2, margin + 70, signatureY + 2);

      // Signature du rédacteur
      const pageWidth = doc.internal.pageSize.width;
      doc.text('Le Rédacteur', pageWidth - margin - 70, signatureY);
      doc.line(pageWidth - margin - 70, signatureY + 2, pageWidth - margin - 20, signatureY + 2);

      // 9. Pied de page
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


}
