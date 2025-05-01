import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../agent-service/Services/notification.service';
import { PaymentService } from '../services/payment.service';


interface PaymentData {
  paymentLink?: string;
  paymentId?: string;
  trackingId?: string;
  amount?: number;
  expiration?: string;
  status?: string;
  deleted?: boolean;
  hasPayment?: boolean;
  paymentDate?: string;
  contratNum?: number;
  paymentType?: string;
}

interface PaymentResponse {
  success: boolean;
  data?: PaymentData;
  message?: string;
  timestamp?: string;
}

@Component({
  selector: 'app-payment-initiate-vie',
  standalone: false,
  templateUrl: './payment-initiate-vie.component.html',
  styleUrl: './payment-initiate-vie.component.css'
})
export class PaymentInitiateVieComponent implements OnInit {
  contratNum!: number;
  loading = true;
  error: string | null = null;
  paymentData: PaymentData | null = null;
  showDebugInfo = false;

  // URLs pour le retour après paiement
  private successUrl = 'http://localhost:4200/dashboard-assure/payment/success/vie';
  private failUrl = 'http://localhost:4200/dashboard-assure/payment/failure';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contratNum = +id;
      this.checkPaymentStatus();
    } else {
      this.error = "Numéro de contrat non trouvé";
      this.loading = false;
    }
  }

  continuePayment(): void {
    if (!this.paymentData || !this.paymentData.paymentLink) {
      this.error = 'Lien de paiement indisponible. Tentative de régénération...';
      this.initiatePaymentVie();
      return;
    }

    try {
      window.open(this.paymentData.paymentLink, '_blank');
    } catch (e) {
      console.error('Erreur lors de la redirection:', e);
      this.error = 'Impossible d\'accéder à la plateforme de paiement. Veuillez contacter le support.';
    }
  }

  initiatePaymentVie(): void {
    this.loading = true;
    this.error = null;

    this.paymentService.generatePaymentLinkVie(
      this.contratNum,
      this.successUrl,
      this.failUrl
    )
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (response: PaymentResponse) => {
        if (response.success && response.data) {
          this.paymentData = response.data;
          console.log('Paiement vie initialisé avec succès:', this.paymentData);
        } else {
          this.error = response.message || 'Erreur lors de l\'initialisation du paiement vie';
        }
      },
      error: (err: any) => {
        this.handlePaymentError(err);
      }
    });
  }

  checkPaymentStatus(): void {
    this.loading = true;
    this.error = null;

    this.paymentService. getPaymentStatusVie(this.contratNum)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: PaymentResponse) => {
          if (response.success) {
            if (response.data?.hasPayment) {
              this.paymentData = response.data;

              if (response.data.status === 'PAID') {
                this.error = 'Ce contrat vie a déjà été payé.';

              } else if (response.data.status === 'FAILED') {
                this.error = 'Le paiement précédent a échoué. Vous pouvez réessayer.';
                this.initiatePaymentVie();
              } else {
                this.error = 'Un paiement est déjà en cours pour ce contrat vie.';
              }
            } else {
              this.initiatePaymentVie();
            }
          } else {
            this.error = response.message || 'Impossible de vérifier le statut du paiement vie';
          }
        },
        error: (err) => {
          console.error('Erreur lors de la vérification:', err);
          this.initiatePaymentVie();
        }
      });
  }

  getExistingPayment(): void {
    this.paymentService.getPaymentStatusVie(this.contratNum)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: PaymentResponse) => {
          if (response.success && response.data) {
            this.paymentData = response.data;

            if (response.data.status === 'PAID') {
              this.error = 'Ce contrat vie a déjà été payé.';
            } else if (response.data.status === 'FAILED' || response.data.deleted) {
              this.error = 'Le paiement précédent a échoué. Réessayez de payer.';
              this.initiatePaymentVie();
            } else {
              this.error = 'Un paiement existe déjà pour ce contrat vie.';
            }
          } else {
            this.error = response.message || 'Impossible de récupérer les informations de paiement vie';
          }
        },
        error: (err) => {
          this.error = 'Erreur lors de la récupération du paiement vie existant';
          if (err.status === 404) {
            this.initiatePaymentVie();
          }
        }
      });
  }

  cancelAndCreateNewPayment(): void {
    this.loading = true;
    this.error = null;

    this.paymentService.cancelPaymentVie(this.contratNum)
      .pipe(finalize(() => {
        console.log('Finalisation de la demande d\'annulation');
      }))
      .subscribe({
        next: (response) => {
          console.log('Paiement vie annulé avec succès:', response);
          setTimeout(() => {
            this.initiatePaymentVie();
          }, 1000);
        },
        error: (err) => {
          if (err.status === 404) {
            this.initiatePaymentVie();
          } else if (err.status === 400 && err.error?.message?.includes('déjà effectué')) {
            this.error = 'Ce contrat vie a déjà été payé et ne peut être annulé.';
            this.loading = false;
          } else {
            this.error = err.error?.message || 'Impossible de supprimer le paiement vie existant';
            this.loading = false;
          }
        }
      });
  }

  private handlePaymentError(err: any): void {
    console.error('Erreur lors de l\'initialisation du paiement vie:', err);

    if (err.status === 400) {
      if (err.error?.message === 'The amount is not accepted') {
        this.error = 'Le montant de la cotisation vie n\'est pas valide. Veuillez contacter le service client.';
      } else if (err.error?.message === 'Un paiement existe déjà pour ce contrat') {
        this.getExistingPayment();
        return;
      } else if (err.error?.message === 'Le montant est trop élevé pour un paiement en ligne') {
        this.error = 'Le montant est trop élevé pour un paiement en ligne. Veuillez effectuer un paiement local.';
        this.createLocalPayment();
      } else {
        this.error = err.error?.message || 'Erreur de validation des données';
      }
    } else if (err.status === 404) {
      this.error = 'Contrat vie non trouvé';
    } else {
      this.error = err.error?.message || 'Erreur de connexion au service de paiement vie';
    }
    this.loading = false;
  }

   createLocalPayment(): void {
    this.loading = true;
    this.paymentService.createLocalPaymentVie(this.contratNum)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: PaymentResponse) => {
          if (response.success && response.data) {
            this.paymentData = response.data;

            this.error = null;
          } else {
            this.error = response.message || 'Erreur lors de la création du paiement local vie';
          }
        },
        error: (err) => {
          this.error = 'Erreur lors de la création du paiement local vie';
          console.error('Erreur API:', err);
        }
      });
  }



  toggleDebugInfo(): void {
    this.showDebugInfo = !this.showDebugInfo;
  }
}
