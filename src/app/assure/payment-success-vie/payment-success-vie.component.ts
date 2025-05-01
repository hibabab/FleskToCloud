import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PaymentService } from '../services/payment.service';
import { NotificationService } from '../../agent-service/Services/notification.service';
import { firstValueFrom } from 'rxjs';


interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ContratVieData {
  numero: number;
  dateEffet: Date;
  cotisation: number;
  garanties: string;
  assureVie: {
    user: {
      prenom: string;
      nom: string;
      Cin: string;
      telephone: string;
      adresse?: {
        rue: string;
        numMaison?: number;
        ville: string;
        codePostal: string;
        Gouvernorat?: string;
        pays: string;
      };
    };
    situationProfessionnelle: string;
    revenuMensuel: number;
  };
  emprunt?: {
    montantPret: number;
    organismePreteur: string;
    tauxInteret: number;
    dateEffet: Date;
  };
  payment?: {
    status: string;
    amount: number;
    paymentDate: Date;
  };
}
interface ContratVie {
  contratVie: {
    numero: number | null;
    garanties: string | null;
    cotisation: number | null;
    dateEffet: Date | string | null;
    dateExpiration: Date | string | null;
  };
  emprunt: {
    organismePreteur: string | null;
    montantPret: number | null;
    dateEffet: Date | string | null;
    datePremierR: Date | string | null;
    dateDernierR: Date | string | null;
    typeAmortissement: string | null;
    periodiciteAmortissement: string | null;
    tauxInteret: number | null;
  } | null;
  assureVie: {
    numSouscription: string | null;
    situationProfessionnelle: string | null;
    revenuMensuel: number | null;
  } | null;
  user: {
    id: number | null;
    nom: string | null;
    prenom: string | null;
    Cin: string | null;
    telephone: string | null;
    email: string | null;
    date_naissance: Date | string | null;
    role: string | null;
    isBlocked: boolean;
  } | null;
  adresse: {
    rue: string | null;
    numMaison: string | null;
    ville: string | null;
    gouvernat: string | null;
    codePostal: string | null;
    pays: string | null;
  } | null;
}

@Component({
  selector: 'app-payment-success-vie',
  standalone: false,
  templateUrl: './payment-success-vie.component.html',
  styleUrl: './payment-success-vie.component.css'
})
export class PaymentSuccessVieComponent implements OnInit, OnDestroy {
  paymentId: string | null = null;
  loading = true;
  verificationResult: any = null;
  error: string | null = null;
  redirectCountdown = 5;
  countdownInterval: any;
  contratData: ContratVie | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const paymentId = this.route.snapshot.queryParamMap.get('payment_id');
    this.paymentId = paymentId;

    if (this.paymentId) {
      this.verifyPaymentVie();
    } else {
      this.error = 'Identifiant de paiement manquant.';
      this.loading = false;
    }
  }

  verifyPaymentVie(): void {
    if (!this.paymentId) {
      this.error = 'Identifiant de paiement invalide.';
      this.loading = false;
      return;
    }

    this.paymentService.verifyPaymentVie(this.paymentId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: async (response) => {
          if (response.success && response.data) {
            this.verificationResult = response.data;
            await this.loadContratVieData(this.verificationResult.contratNum);
            await this.generateContratPDF();
            await this.generatePaymentReceipt();
            await this.updateContratStatusAndNotify();
            this.startRedirectCountdown();
          } else {
            this.error = response.message || 'La vérification du paiement vie a échoué.';
          }
        },
        error: (error) => {
          console.error('Erreur lors de la vérification du paiement vie', error);
          this.error = error.error?.message || 'Erreur lors de la vérification du paiement vie.';
        }
      });
  }

  private async loadContratVieData(contratNum: number): Promise<void> {
    try {
      const response = await this.http.get<ContratVie>(
        `http://localhost:3000/contratvie/details/${contratNum}`
      ).toPromise();

      if (response) {
        this.contratData=response;
            } else {
        throw new Error('Erreur lors du chargement des données du contrat');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du contrat vie:', error);
      throw error;
    }
  }

  private async generateContratPDF(): Promise<void> {
    if (!this.contratData) return;

    try {
      const { jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF('p', 'mm', 'a4') as any;
      doc.setFont('helvetica');

      // Variables de position
      let yOffset = 10;
      const margin = 10;
      const lineHeight = 5;
      const sectionSpacing = 5;
      const tealColor = [0, 105, 92];

      // 1. En-tête avec logo
      try {
        const logoBase64 = await this.loadImageAsBase64('assets/images/logoFC.png');
        doc.addImage(logoBase64, 'PNG', margin, yOffset, 20, 20);
      } catch (error) {
        console.warn('Logo non chargé');
      }

      // Titre principal
      doc.setFontSize(12);
      doc.setTextColor(...tealColor);
      doc.text('CONTRAT D\'ASSURANCE VIE', 105, yOffset + 12, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Document confidentiel - Ne pas divulguer', 105, yOffset + 18, { align: 'center' });
      yOffset += 25;

      // 2. Informations de l'assuré
      doc.setFontSize(10);
      doc.setTextColor(...tealColor);
      doc.text('INFORMATIONS DE L\'ASSURÉ', margin, yOffset);
      yOffset += lineHeight;

      const user = this.contratData.user;
      autoTable(doc, {
        startY: yOffset,
        body: [
          ['Nom', 'Prénom', 'CIN', 'Téléphone', 'Adresse'],
          [
            user?.nom || 'N/A',
            user?.prenom || 'N/A',
            user?.Cin || 'N/A',
            user?.telephone || 'N/A',
            this.formatAdresse(this.contratData.adresse)
          ]
        ],
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        headStyles: { fillColor: [0, 128, 128], textColor: 255, fontSize: 9 },
        theme: 'grid',
        margin: { left: margin, right: margin }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 3. Informations du contrat
      doc.setFontSize(10);
      doc.setTextColor(...tealColor);
      doc.text('INFORMATIONS DU CONTRAT', margin, yOffset);
      yOffset += lineHeight;

      const contratVie = this.contratData.contratVie;
      autoTable(doc, {
        startY: yOffset,
        body: [
          ['N° Contrat', 'Date d\'effet','Date d\'expiration', 'Cotisation', 'Garanties'],
          [
            contratVie?.numero?.toString() || 'N/A',
            contratVie?.dateEffet ? this.formatDate(contratVie.dateEffet) : 'N/A',
            contratVie?.dateExpiration ? this.formatDate(contratVie.dateEffet) : 'N/A',
            `${contratVie?.cotisation || '0.00'} DT`,
            contratVie?.garanties || 'N/A'
          ]
        ],
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        headStyles: { fillColor: [0, 128, 128], textColor: 255, fontSize: 9 },
        theme: 'grid',
        margin: { left: margin, right: margin }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 4. Informations spécifiques
      doc.setFontSize(10);
      doc.setTextColor(...tealColor);
      doc.text('INFORMATIONS DE SOUSCRIPTION', margin, yOffset);
      yOffset += lineHeight;

      const assureVie = this.contratData.assureVie;
      autoTable(doc, {
        startY: yOffset,
        body: [
          ['Situation Professionnelle', 'Revenu Mensuel'],
          [
            assureVie?.situationProfessionnelle || 'N/A',
            `${assureVie?.revenuMensuel || '0.00'} DT`
          ]
        ],
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        headStyles: { fillColor: [0, 128, 128], textColor: 255, fontSize: 9 },
        theme: 'grid',
        margin: { left: margin, right: margin }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 5. Informations de l'emprunt (si existant)
      if (this.contratData.emprunt) {
        doc.setFontSize(10);
        doc.setTextColor(...tealColor);
        doc.text('INFORMATIONS DE L\'EMPRUNT', margin, yOffset);
        yOffset += lineHeight;

        const emprunt = this.contratData.emprunt;
        autoTable(doc, {
          startY: yOffset,
          body: [
            ['Organisme Prêteur', 'Montant Prêt', 'Taux Intérêt', 'Date Effet', 'Date premier remboursement', 'Date dernier remboursement'],
            [
              emprunt?.organismePreteur || 'N/A',
              `${emprunt?.montantPret || '0.00'} DT`,
              `${(emprunt?.tauxInteret || 0)}%`,
              emprunt?.dateEffet ? this.formatDate(emprunt.dateEffet) : 'N/A',
              emprunt?.datePremierR ? this.formatDate(emprunt.datePremierR) : 'N/A',
              emprunt?.dateDernierR ? this.formatDate(emprunt.dateDernierR) : 'N/A'
            ]
          ],
          styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
          headStyles: { fillColor: [0, 128, 128], textColor: 255, fontSize: 9 },
          theme: 'grid',
          margin: { left: margin, right: margin }
        });
        yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;
      }

      // Signatures
      const signatureY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(10);
      doc.text('Le Sociétaire', margin + 20, signatureY);
      doc.line(margin + 20, signatureY + 2, margin + 70, signatureY + 2);

      const pageWidth = doc.internal.pageSize.width;
      doc.text('Le Rédacteur', pageWidth - margin - 70, signatureY);
      doc.line(pageWidth - margin - 70, signatureY + 2, pageWidth - margin - 20, signatureY + 2);

      // Pied de page
      doc.setFontSize(7);
      doc.setTextColor(100);
      const footerY = 285;
      doc.line(margin, footerY, 200 - margin, footerY);
      doc.text('FLESK COVER - Votre partenaire assurance', margin, footerY + 4);
      doc.text('Email: contact@fleskcover.com | Tél: 24051646', margin, footerY + 8);
      doc.text(`Document généré le ${new Date().toLocaleDateString()}`, 200 - margin, footerY + 8, { align: 'right' });

      // Sauvegarde du PDF
      const fileName = `Contrat_Vie_${this.contratData.contratVie?.numero || new Date().getTime()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur génération contrat PDF:', error);
      throw error;
    }
  }

  private formatDate(date: Date | string | null): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR');
  }



  private async generatePaymentReceipt(): Promise<void> {
    if (!this.verificationResult || !this.contratData) return;

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
      const tealColor = [0, 105, 92];

      // 1. En-tête avec logo
      try {
        const logoBase64 = await this.loadImageAsBase64('assets/images/logoFC.png');
        doc.addImage(logoBase64, 'PNG', margin, yOffset, 25, 25);
      } catch (error) {
        console.warn('Logo non chargé');
      }

      // Titre principal
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
        head: [['Détail', '']],
        body: [
          ['Référence Paiement', this.paymentId || 'N/A'],
          ['Statut', 'Payé'],
          ['Date Paiement', new Date().toLocaleDateString()],
          ['Montant', `${this.verificationResult.amount || '0.00'} DT`],
          ['N° Contrat', this.contratData.contratVie.numero || 'N/A'],
          ['Nom Assuré', `${this.contratData.user?.prenom} ${this.contratData.user?.nom}`]
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
      const fileName = `Recu_Paiement_${this.paymentId || new Date().getTime()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur génération reçu PDF:', error);
      throw error;
    }
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

  private async updateContratStatusAndNotify(): Promise<void> {
    if (!this.verificationResult?.contratNum || !this.contratData) {
      console.warn('Données de vérification ou de contrat manquantes');
      return;
    }

    try {
      // URL de l'API gateway pour les contrats vie
      const updateUrl = `http://localhost:3000/contratvie/${this.verificationResult.contratNum}/validate`;

      // Mettre à jour le statut du contrat via HTTP
      const updateResponse: any = await firstValueFrom(
        this.http.patch(updateUrl, {

        })
      );

      if (updateResponse && updateResponse.success) {
        console.log('Statut du contrat vie mis à jour avec succès');
        await this.sendNotification();
      } else {
        console.warn('Échec de la mise à jour du statut du contrat vie');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat vie:', error);
      throw error;
    }
  }

  private async sendNotification(): Promise<void> {
    try {
      if (!this.contratData || !this.verificationResult) {
        console.warn('Les données du contrat sont manquantes, impossible de générer la notification.');
        return;
      }

      // Adaptez les chemins d'accès aux données selon la structure de contratData pour les contrats vie
      // Utilisation d'une interface pour définir la structure attendue
      interface UserData {
        prenom?: string;
        nom?: string;
        Cin?: string;
        telephone?: string;
        adresse?: Record<string, any>;
      }

      // Utilisation d'une assertion de type pour éviter les erreurs TypeScript
      const user = (this.contratData.user || {}) as UserData;
      const adresse = user.adresse || {};
      const adresseComplete = this.formatAdresse(adresse);

      const message = `💰 Paiement confirmé - Contrat Vie #${this.verificationResult.contratNum}
  👤 Assuré: ${user.prenom || 'N/A'} ${user.nom || 'N/A'}
  🆔 CIN: ${user.Cin || 'N/A'}
  📞 Téléphone: ${user.telephone || 'N/A'}
  🏠 Adresse: ${adresseComplete}
  💳 Montant: ${this.verificationResult.amount || 'N/A'} DT
  📅 Date: ${new Date().toLocaleDateString()}`;

      // Utilisation de firstValueFrom pour gérer la Promise
      const notificationResult = await firstValueFrom(
        this.notificationService.notifyAllUsers(
          message,
          'pending' 
        )
      );

      if (notificationResult) {
        console.log('Notification de paiement envoyée à tous les agents avec succès');
      } else {
        console.warn('Échec de l\'envoi de la notification de paiement aux agents');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      throw error;
    }
  }

  private formatAdresse(adresse: any): string {
    if (!adresse) return 'Non renseignée';
    return [
      adresse.numMaison,
      adresse.rue,
      adresse.codePostal,
      adresse.ville,
      adresse.Gouvernorat,
      adresse.pays
    ].filter(Boolean).join(', ');
  }

  startRedirectCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.redirectCountdown--;

      if (this.redirectCountdown <= 0) {
        clearInterval(this.countdownInterval);
        this.redirectToContract();
      }
    }, 1000);
  }

  redirectToContract(): void {
    if (this.verificationResult?.contratNum) {
      this.router.navigate(['/dashboard-assure/contrats-vie', this.verificationResult.contratNum]);
    } else {
      this.router.navigate(['/dashboard-assure']);
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
