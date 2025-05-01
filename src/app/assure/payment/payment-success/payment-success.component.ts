import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PaymentService } from '../../services/payment.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../agent-service/Services/notification.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ContratData {
  contrat: {
    num: number;
    // autres propriétés du contrat...
  };
  assure: {
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
    bonusMalus: number;
  };
}

@Component({
  selector: 'app-payment-success',
  standalone: false,
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent implements OnInit {
  paymentId: string | null = null;
  loading = true;
  verificationResult: any = null;
  error: string | null = null;
  redirectCountdown = 5;
  countdownInterval: any;
  userDetails: any = null;
  contratData: ContratData | null = null;
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
      this.verifyPayment();
    } else {
      this.error = 'Identifiant de paiement manquant.';
      this.loading = false;
    }
  }



  verifyPayment(): void {
    if (!this.paymentId) {
      this.error = 'Identifiant de paiement invalide.';
      this.loading = false;
      return;
    }

    this.paymentService.verifyPayment(this.paymentId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: async (response) => {
          if (response.success) {
            this.verificationResult = response.data;
                  console.log(response.data);
            // Mettre à jour le statut et notifier après vérification réussie
            if (this.verificationResult?.contratNum) {
              // Charger d'abord les données du contrat
              await this.loadContratData(this.verificationResult.contratNum);
              await this.updateContratStatusAndNotify(this.verificationResult.contratNum);
              await this.generatePaymentReceipt(response.data);
            }

            this.startRedirectCountdown();
          } else {
            this.error = 'La vérification a échoué.';
          }
        },
        error: (error) => {
          console.error('Erreur lors de la vérification du paiement', error);
          this.error = error.error?.message || 'Erreur lors de la vérification du paiement.';
        }
      });
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
      this.router.navigate(['/contrats', this.verificationResult.contratNum]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
  private async updateContratStatusAndNotify(contratNum: number): Promise<void> {
    try {
      // URL de votre API gateway
      const updateUrl = `http://localhost:3000/contrat-auto-geteway/contrat/${contratNum}/status`;

      // Mettre à jour le statut du contrat via HTTP
      const updateResponse: any = await this.http.patch(updateUrl, {
        status: 'valide'
      }).toPromise();

      if (updateResponse && updateResponse.success) {
        console.log('Statut du contrat mis à jour avec succès');
        if (!this.contratData) {
  console.warn('Les données du contrat sont manquantes, impossible de générer la notification.');
  return;
}

const user = this.contratData.assure?.user || {};
const adresse = user?.adresse || {};
const bonusMalus = this.contratData.assure?.bonusMalus ?? 'N/A';
const adresseComplete = this.formatAdresse(adresse);
 const message = `💰 Paiement confirmé - Contrat #${contratNum}
👤 Assuré: ${user.prenom || 'N/A'} ${user.nom || 'N/A'}
🆔 CIN: ${user.Cin || 'N/A'}
📞 Téléphone: ${user.telephone || 'N/A'}
🏠 Adresse: ${adresseComplete}
⭐ Bonus/Malus: ${bonusMalus}
💳 Montant: ${this.verificationResult.amount || 'N/A'} DT
📅 Date: ${new Date().toLocaleDateString()}`;
const notificationResult = await this.notificationService.notifyAllUsers(
  message,
  'pending'
).toPromise();

        if (notificationResult) {
          console.log('Notification de paiement envoyée à tous les agents avec succès');
        } else {
          console.warn('Échec de l\'envoi de la notification de paiement aux agents');
        }
      } else {
        console.warn('Échec de la mise à jour du statut du contrat');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat ou de l\'envoi de la notification:', error);
      throw error;
    }
  }
  private async loadContratData(contratNum: number): Promise<void> {
    try {
      const response = await this.http.get<ApiResponse<ContratData>>(
        `http://localhost:3000/contrat-auto-geteway/contrat/${contratNum}`
      ).toPromise();

      if (response?.success && response.data) {
        this.contratData = response.data;
      } else {
        console.warn('Données du contrat non disponibles');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du contrat:', error);
    }
  }

  private formatAdresse(adresse: any): string {
    if (!adresse) return 'Non renseignée';

    return [
      adresse.numMaison ? `${adresse.numMaison}` : '',
      adresse.rue,
      adresse.codePostal,
      adresse.ville,
      adresse.Gouvernorat,
      adresse.pays
    ].filter(Boolean).join(', ');
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
          ['Statut', 'Date Paiement', 'Montant'],
          [

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
            paymentData.contratNum || 'N/A',
            new Date().toLocaleDateString(),
            'Paiement en ligne'
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
