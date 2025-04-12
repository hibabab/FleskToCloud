import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PaymentService } from '../../services/payment.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    // Récupérer le paymentId depuis l'URL (paramètre de requête)
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
    // Ajout d'une vérification TypeScript pour s'assurer que paymentId n'est pas null
    if (!this.paymentId) {
      this.error = 'Identifiant de paiement invalide.';
      this.loading = false;
      return;
    }

    this.paymentService.verifyPayment(this.paymentId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.verificationResult = response.data;
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
}
