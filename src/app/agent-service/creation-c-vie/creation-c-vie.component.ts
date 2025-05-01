import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-creation-c-vie',
  standalone: false,
  templateUrl: './creation-c-vie.component.html',
  styleUrl: './creation-c-vie.component.css'
})
export class CreationCVieComponent implements OnInit {
  currentStep = 1;
  cin: number=0;
  userAge: number | null = null;
  isSubmitting = false;
  errorMessage: string | null = null;

  assureInfo = {
    situationProfessionnelle: '',
    revenuMensuel: null,
  };

  empruntInfo = {
    organismePreteur: '',
    montantPret: null,
    dateEffet: '',
    datePremierR: '',
    dateDernierR: '',
    typeAmortissement: '',
    periodiciteAmortissement: '',
    tauxInteret: null
  };

  garanties = {
    deces: true,
    invalidite: false,
  };

  minDate: string;
  maxDate: string;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const today = new Date();
    const year = today.getFullYear();

    // Date min = aujourd'hui
    this.minDate = today.toISOString().split('T')[0];

    // Date max = 31 décembre de l'année courante
    this.maxDate = `${year}-12-31`;
  }
  redirectToRegistration(): void {
    // Redirection vers la page d'inscription
    console.log('Redirection vers la page d\'inscription');
    this.router.navigate(['agent/compte']);
  }
  ngOnInit(): void {
    // Initialiser la date d'effet au jour actuel
    const today = new Date();
    this.empruntInfo.dateEffet = today.toISOString().split('T')[0];
  }

  nextStep(): void {
    if (this.currentStep < 2) {
      // Vérifier le CIN avant de passer à l'étape suivante
      if (this.currentStep === 1) {
        this.verifyCin();
      } else {
        this.currentStep++;
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  verifyCin(): void {

    this.getUserInfo(this.cin
    )
      .then(userData => {
        // Si la vérification est réussie, passer à l'étape suivante
        this.currentStep++;
      })
      .catch(error => {
        console.error('Erreur lors de la vérification du CIN:', error);
        this.errorMessage = 'CIN non trouvé ou erreur de vérification';
      });
  }

  async getUserInfo(cin: number): Promise<any> {
    const apiUrl = `http://localhost:3000/auth/user/${cin}`;
    return this.http.get<any>(apiUrl).toPromise();
  }

  // Calculer la cotisation en fonction des données du formulaire
  calculateCotisation(): number {
    if (!this.empruntInfo.montantPret) return 0;

    const montant = this.empruntInfo.montantPret;
    let cotisation = montant < 10000 ? montant * 0.005 : montant * 0.01;

    // Si nous avons des données d'âge, appliquer les majorations
    if (this.userAge && this.userAge > 50) {
      cotisation += 50;
    }

    // Majoration pour les garanties
    if (this.garanties.deces && this.garanties.invalidite) {
      cotisation += 30;
    }

    // Arrondir à 2 décimales
    return parseFloat(cotisation.toFixed(2));
  }

  // Préparer les données pour l'API
  prepareFormData(): any {

    const cotisation = this.calculateCotisation();
    let garantiesString = '';
    if (this.garanties.deces) garantiesString += 'Deces;';
    if (this.garanties.invalidite) garantiesString += 'Invalidite;';

    // Convertir les valeurs numériques si nécessaire
    const montantPret = this.empruntInfo.montantPret ? parseFloat(String(this.empruntInfo.montantPret)) : 0;
    const tauxInteret = this.empruntInfo.tauxInteret ? parseFloat(String(this.empruntInfo.tauxInteret)) : 0;
    const revenuMensuel = this.assureInfo.revenuMensuel ? parseFloat(String(this.assureInfo.revenuMensuel)) : 0;

    return {
      assureVie: {
        situationProfessionnelle: this.assureInfo.situationProfessionnelle,
        revenuMensuel: revenuMensuel
      },
      contratVie: {
        dateEffet: this.empruntInfo.dateEffet,
        cotisation: cotisation,
        garanties: garantiesString.slice(0, -1) // Enlever le dernier ';'
      },
      emprunt: {
        organismePreteur: this.empruntInfo.organismePreteur,
        montantPret: montantPret,
        dateEffet: this.empruntInfo.dateEffet,
        datePremierR: this.empruntInfo.datePremierR,
        dateDernierR: this.empruntInfo.dateDernierR,
        typeAmortissement: this.empruntInfo.typeAmortissement,
        periodiciteAmortissement: this.empruntInfo.periodiciteAmortissement,
        tauxInteret: tauxInteret
      }
    };
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.errorMessage = null;

    const formData = this.prepareFormData();
    const cinValue = this.cin;

    // Appel à l'API pour créer le contrat vie
    this.http.post(`http://localhost:3000/contratvie/${cinValue}`, formData)
      .subscribe(
        (response: any) => {
          console.log('Contrat créé avec succès:', response);

          // Si la création du contrat est réussie, créer le paiement local
          if (response && response.numero) {
            this.downloadContratVie(response,cinValue);
            this.createLocalPayment(response.numero);
          } else {
            this.isSubmitting = false;
            this.errorMessage = 'Numéro de contrat non reçu du serveur';
          }
        },
        error => {
          console.error('Erreur lors de la création du contrat:', error);
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'Erreur lors de la création du contrat';
        }
      );
  }

  createLocalPayment(contratNum: number): void {
    const paymentData = {
      contratNum: contratNum
    };

    this.http.post('http://localhost:3000/payments/vie/local', paymentData)
      .subscribe(
        (response: any) => {
          console.log('Paiement local créé avec succès:', response);
          this.isSubmitting = false;

          // Télécharger le reçu de paiement
          this.downloadPaymentReceipt(response.data);

          // Rediriger vers une page de succès ou afficher un message
          this.router.navigate(['/success'], {
            queryParams: {
              contratNum: contratNum,
              paymentId: response.data.paymentId
            }
          });
        },
        error => {
          console.error('Erreur lors de la création du paiement:', error);
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'Erreur lors de la création du paiement';
        }
      );
  }


  private async loadImageAsBase64(url: string): Promise<string> {
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
  async downloadContratVie(contratData: any, cin: number): Promise<void> {
    try {
      // Récupérer les informations de l'assuré
      const userInfo = await this.getUserInfo(cin);

      const { jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF('p', 'mm', 'a4') as any;
      doc.setFont('helvetica');

      // Variables de position avec des valeurs réduites pour gagner de l'espace
      let yOffset = 10; // Réduit encore plus
      const margin = 10;
      const lineHeight = 5;
      const sectionSpacing = 5;
      const tealColor = [0, 105, 92];

      // 1. En-tête avec logo
      try {
        const logoBase64 = await this.loadImageAsBase64('assets/images/logoFC.png');
        doc.addImage(logoBase64, 'PNG', margin, yOffset, 20, 20); // Logo plus petit
      } catch (error) {
        console.warn('Logo non chargé');
      }

      // Titre principal
      doc.setFontSize(12); // Taille réduite
      doc.setTextColor(...tealColor);
      doc.text('CONTRAT D\'ASSURANCE VIE', 105, yOffset + 12, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Document confidentiel - Ne pas divulguer', 105, yOffset + 18, { align: 'center' });
      yOffset += 25;

      // 2. Informations de l'assuré (format horizontal)
      doc.setFontSize(10);
      doc.setTextColor(...tealColor);
      doc.text('INFORMATIONS DE L\'ASSURÉ', margin, yOffset);
      yOffset += lineHeight;

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['Nom', 'Prénom', 'CIN', 'Téléphone', 'Date de naissance', 'Adresse'],
          [
            userInfo.nom || 'N/A',
            userInfo.prenom || 'N/A',
            userInfo.Cin || 'N/A',
            userInfo.telephone || 'N/A',
            userInfo.date_naissance ? new Date(userInfo.date_naissance).toLocaleDateString() : 'N/A',
            `${userInfo.adresse?.rue || ''} ${userInfo.adresse?.numMaison || ''}, ${userInfo.adresse?.codePostal || ''} ${userInfo.adresse?.ville || ''}, ${userInfo.adresse?.pays || ''}`
          ]
        ],
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [0, 128, 128],
          textColor: 255,
          fontSize: 9
        },
        theme: 'grid',
        margin: { left: margin, right: margin }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 3. Informations du contrat (format horizontal)
      doc.setFontSize(10);
      doc.setTextColor(...tealColor);
      doc.text('INFORMATIONS DU CONTRAT', margin, yOffset);
      yOffset += lineHeight;

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['N° Contrat', 'Date d\'effet', 'Date d\'expiration','Cotisation', 'Garanties'],
          [
            contratData.numero || 'N/A',
            contratData.dateEffet || 'N/A',
            contratData.dateExpiration || 'N/A',
            `${contratData.cotisation || '0.00'} DT`,
            contratData.garanties || 'N/A'
          ]
        ],
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [0, 128, 128],
          textColor: 255,
          fontSize: 9
        },
        theme: 'grid',
        margin: { left: margin, right: margin }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 4. Informations spécifiques à l'assurance vie (format horizontal)
      doc.setFontSize(10);
      doc.setTextColor(...tealColor);
      doc.text('INFORMATIONS DE SOUSCRIPTION', margin, yOffset);
      yOffset += lineHeight;

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['N° Souscription', 'Situation Professionnelle', 'Revenu Mensuel'],
          [
            contratData.assureVie.numSouscription || 'N/A',
            contratData.assureVie.situationProfessionnelle || 'N/A',
            `${contratData.assureVie.revenuMensuel || '0.00'} DT`
          ]
        ],
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [0, 128, 128],
          textColor: 255,
          fontSize: 9
        },
        theme: 'grid',
        margin: { left: margin, right: margin }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 5. Informations de l'emprunt (si existant) (format horizontal)
      if (contratData.emprunt) {
        doc.setFontSize(10);
        doc.setTextColor(...tealColor);
        doc.text('INFORMATIONS DE L\'EMPRUNT', margin, yOffset);
        yOffset += lineHeight;

        autoTable(doc, {
          startY: yOffset,
          body: [
            ['Organisme Prêteur', 'Montant Prêt', 'Taux Intérêt', 'Date Premier Remb.', 'Date Dernier Remb.', 'Type Amortissement', 'Périodicité'],
            [
              contratData.emprunt.organismePreteur || 'N/A',
              `${contratData.emprunt.montantPret || '0.00'} DT`,
              `${(contratData.emprunt.tauxInteret * 100 || 0).toFixed(2)}%`,
              contratData.emprunt.datePremierR || 'N/A',
              contratData.emprunt.dateDernierR || 'N/A',
              contratData.emprunt.typeAmortissement || 'N/A',
              contratData.emprunt.periodiciteAmortissement || 'N/A'
            ]
          ],
          styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [0, 128, 128],
            textColor: 255,
            fontSize: 9
          },
          theme: 'grid',
          margin: { left: margin, right: margin }
        });
        yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;
      }

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

      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // Pied de page compact
      doc.setFontSize(7);
      doc.setTextColor(100);
      const footerY = 285; // Position plus basse
      doc.line(margin, footerY, 200 - margin, footerY);
      doc.text('FLESK COVER - Votre partenaire assurance', margin, footerY + 4);
      doc.text('Email: contact@fleskcover.com | Tél: 24051646', margin, footerY + 8);
      doc.text(`Document généré le ${new Date().toLocaleDateString()}`, 200 - margin, footerY + 8, { align: 'right' });

      // Génération du fichier
      const fileName = `Contrat_Vie_${contratData.numero || new Date().getTime()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur génération contrat PDF:', error);
      throw error;
    }
  }

  async downloadPaymentReceipt(paymentData: any): Promise<void> {
    try {
      const { jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF('p', 'mm', 'a4') as any;
      doc.setFont('helvetica');

      // Variables de position
      let yOffset = 15;
      const margin = 15;
      const lineHeight = 6;
      const sectionSpacing = 8;
      const tealColor = [0, 105, 92]; // Teal-800

      // 1. En-tête avec logo
      try {
        const logoBase64 = await this.loadImageAsBase64('assets/images/logoFC.png');
        doc.addImage(logoBase64, 'PNG', margin, yOffset, 25, 25);
      } catch (error) {
        console.warn('Logo non chargé');
      }

      // Titre principal avec couleur teal
      doc.setFontSize(14);
      doc.setTextColor(...tealColor);
      doc.text('REÇU DE PAIEMENT', 105, yOffset + 15, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Reçu valide comme justificatif de paiement', 105, yOffset + 22, { align: 'center' });
      yOffset += 30;

      // 2. Informations du paiement
      doc.setFontSize(11);
      doc.setTextColor(...tealColor);
      doc.text('INFORMATIONS DE PAIEMENT', margin, yOffset);
      yOffset += lineHeight + 3;

      autoTable(doc, {
        startY: yOffset,
        head: [['Détail', 'Valeur']],
        body: [
          ['Référence Paiement', paymentData.paymentId || 'N/A'],
          ['Statut', paymentData.status || 'N/A'],
          ['Date Paiement', paymentData.paymentDate ? new Date(paymentData.paymentDate).toLocaleDateString() : 'N/A'],
          ['Montant', `${paymentData.amount || '0.00'} DT`],
          ['Type Paiement', paymentData.paymentType || 'LOCAL_CASH'],
          ['N° Contrat', paymentData.contratNum || 'N/A']
        ],
        styles: {
          fontSize: 9,
          cellPadding: 4,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [0, 128, 128],
          textColor: 255,
          fontSize: 10
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 'auto' }
        },
        margin: { left: margin, right: margin }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 3. Signature
      doc.setFontSize(9);
      doc.text('Signature', 160, yOffset + 15);
      doc.line(160, yOffset + 17, 190, yOffset + 17);

      // Pied de page professionnel
      doc.setFontSize(8);
      doc.setTextColor(100);
      const footerY = 280;
      doc.line(margin, footerY, 200 - margin, footerY);
      doc.text('FLESK COVER - Votre partenaire assurance', margin, footerY + 5);
      doc.text('Email: contact@fleskcover.com | Tél: 24051646', margin, footerY + 10);
      doc.text('Adresse: Rue de l\'assurance, Tunis', margin, footerY + 15);
      doc.text(`Document généré le ${new Date().toLocaleDateString()}`, 200 - margin, footerY + 15, { align: 'right' });

      // Génération du fichier
      const fileName = `Recu_Paiement_${paymentData.paymentId || new Date().getTime()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur génération reçu PDF:', error);
      throw error;
    }
  }


}
