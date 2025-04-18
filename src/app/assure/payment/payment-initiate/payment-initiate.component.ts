import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import {  PaymentService } from '../../services/payment.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../agent-service/Services/notification.service';

interface PaymentData {
  paymentLink?: string; // Pour l'interface utilisateur
  paymentId?: string;
  trackingId?: string;
  amount?: number;
  expiration?: string;
  status?: string;
  deleted?: boolean;
  hasPayment?: boolean;
  paymentDate?: string;
}

interface PaymentResponse {
  success: boolean;
  data?: PaymentData;
  message?: string;
  timestamp?: string;
}



@Component({
  selector: 'app-payment-initiate',
  standalone: false,
  templateUrl: './payment-initiate.component.html',
  styleUrls: ['./payment-initiate.component.css']
})
export class PaymentInitiateComponent implements OnInit {
  contratNum!: number;
  loading = true;
  error: string | null = null;
  paymentData: PaymentData | null = null;
  showDebugInfo = false;

  // URLs pour le retour après paiement
  private successUrl = 'http://localhost:4200/dashboard-assure/payment/success';
  private failUrl = 'http://localhost:4200/dashboard-assure/payment/failure';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private notificationService: NotificationService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    // Récupérer l'ID du contrat depuis les paramètres de la route
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
      this.initiatePayment();
      return;
    }

    // Rediriger vers la plateforme de paiement
    try {
      window.open(this.paymentData.paymentLink, '_blank');
    } catch (e) {
      console.error('Erreur lors de la redirection:', e);
      this.error = 'Impossible d\'accéder à la plateforme de paiement. Veuillez contacter le support.';
    }
  }

  initiatePayment(): void {
    this.loading = true;
    this.error = null;

    // Appeler le service avec les URLs de retour
    this.paymentService.generatePaymentLink(
      this.contratNum,
      this.successUrl,
      this.failUrl
    )
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (response: PaymentResponse) => {
        if (response.success && response.data) {
          this.paymentData = response.data;
          console.log('Paiement initialisé avec succès:', this.paymentData);
        } else {
          this.error = response.message || 'Erreur lors de l\'initialisation du paiement';
          console.error('Réponse invalide:', response);
        }
      },
      error: (err: any) => {
        console.error('Erreur lors de l\'initialisation du paiement:', err);

        // Traitement spécifique selon les codes d'erreur
        if (err.status === 400) {
          if (err.error?.message === 'The amount is not accepted') {
            this.error = 'Le montant de l\'échéance n\'est pas valide. Veuillez contacter le service client.';
          } else if (err.error?.message === 'Un paiement existe déjà pour ce contrat') {
            this.getExistingPayment();
            return;
          } else {
            this.error = err.error?.message || 'Erreur de validation des données';
          }
        } else if (err.status === 404) {
          this.error = 'Contrat non trouvé';
        } else {
          this.error = err.error?.message || 'Erreur de connexion au service de paiement';
        }
      }
    });
  }

  checkPaymentStatus(): void {
    this.loading = true;
    this.error = null;

    this.paymentService.getPaymentStatus(this.contratNum)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: async (response: PaymentResponse) => {
          if (response.success) {
            if (response.data?.hasPayment) {
              this.paymentData = response.data;

              if (response.data.status === 'PAID') {
                this.error = 'Ce contrat a déjà été payé.';

                // Mettre à jour le statut du contrat et notifier l'agent
             

              } else if (response.data.status === 'FAILED') {
                this.error = 'Le paiement précédent a échoué. Vous pouvez réessayer.';
                this.initiatePayment();
              } else {
                this.error = 'Un paiement est déjà en cours pour ce contrat.';
              }
            } else {
              this.initiatePayment();
            }
          } else {
            this.error = response.message || 'Impossible de vérifier le statut du paiement';
            console.error('Réponse invalide:', response);
          }
        },
        error: (err) => {
          console.error('Erreur lors de la vérification:', err);
          this.initiatePayment();
        }
      });
  }

  getExistingPayment(): void {
    this.paymentService.getPaymentStatus(this.contratNum)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: PaymentResponse) => {
          if (response.success && response.data) {
            this.paymentData = response.data;

            if (response.data.status === 'PAID') {
              this.error = 'Ce contrat a déjà été payé.';
            } else if (response.data.status === 'FAILED' || response.data.deleted) {
              // Pour les paiements en erreur ou supprimés, on propose de réessayer
              this.error = 'Le paiement précédent a échoué. Réessayez de payer.';
              // Option: initialiser automatiquement un nouveau paiement
              this.initiatePayment();
            } else {
              this.error = 'Un paiement existe déjà pour ce contrat.';
            }
          } else {
            this.error = response.message || 'Impossible de récupérer les informations de paiement';
          }
        },
        error: (err) => {
          this.error = 'Erreur lors de la récupération du paiement existant';
          console.error('Erreur API:', err);

          // Si l'erreur est 404 (Not Found), cela peut signifier que le paiement a été supprimé
          if (err.status === 404) {
            this.initiatePayment();
          }
        }
      });
  }

  cancelAndCreateNewPayment(): void {
    this.loading = true;
    this.error = null;

    this.paymentService.cancelPayment(this.contratNum)
      .pipe(finalize(() => {
        console.log('Finalisation de la demande d\'annulation');
      }))
      .subscribe({
        next: (response) => {
          console.log('Paiement précédent annulé avec succès:', response);
          // Ajout d'un délai pour s'assurer que le backend a bien enregistré l'annulation
          setTimeout(() => {
            this.initiatePayment();
          }, 1000);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du paiement:', err);

          // Gérer le cas où le paiement n'existe pas (404)
          if (err.status === 404) {
            console.log('Aucun paiement à annuler, tentative de création directe');
            this.initiatePayment();
          } else if (err.status === 400 && err.error?.message?.includes('déjà effectué')) {
            // Si paiement déjà effectué
            this.error = 'Ce contrat a déjà été payé et ne peut être annulé.';
            this.loading = false;
          } else {
            this.error = err.error?.message || 'Impossible de supprimer le paiement existant';
            this.loading = false;
          }
        }
      });
  }

  toggleDebugInfo(): void {
    this.showDebugInfo = !this.showDebugInfo;
  }

}
