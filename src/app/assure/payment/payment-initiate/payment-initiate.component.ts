import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PaymentResponse, PaymentService } from '../../services/payment.service';

interface PaymentData {
  paymentLink?: string;
  paymentId?: string;
  trackingId?: string;
  amount?: number;
  expiration?: string;
  status?: string;
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

  // Urls pour le retour après paiement
  private successUrl = 'http://localhost:4200/dashboard-assure/payment/success';
  private failUrl = 'http://localhost:4200/dashboard-assure/payment/failure';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    // Récupérer l'ID du contrat depuis les paramètres de la route
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contratNum = +id;
      // Appeler directement generatePaymentLink à l'ouverture de la page
      this.initiatePayment();
    } else {
      this.error = "Numéro de contrat non trouvé";
      this.loading = false;
      this.router.navigate(['/contrats']);
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
          this.error = 'Erreur lors de l\'initialisation du paiement';
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

  getExistingPayment(): void {
    this.paymentService.getPaymentStatus(this.contratNum)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: PaymentResponse) => {
          if (response.success && response.data) {
            this.paymentData = response.data;

            if (response.data.status === 'PAID') {
              this.error = 'Ce contrat a déjà été payé.';
            } else {
              this.error = 'Un paiement existe déjà pour ce contrat.';
            }
          } else {
            this.error = 'Impossible de récupérer les informations de paiement';
          }
        },
        error: (err) => {
          this.error = 'Erreur lors de la récupération du paiement existant';
          console.error('Erreur API:', err);
        }
      });
  }

  cancelAndCreateNewPayment(): void {
    this.loading = true;
    this.error = null;

    this.paymentService.cancelPayment(this.contratNum)
      .pipe(finalize(() => {}))
      .subscribe({
        next: () => {
          console.log('Paiement précédent supprimé avec succès');
          this.initiatePayment();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du paiement:', err);
          this.error = 'Impossible de supprimer le paiement existant';
          this.loading = false;
        }
      });
  }

  toggleDebugInfo(): void {
    this.showDebugInfo = !this.showDebugInfo;
  }
}
