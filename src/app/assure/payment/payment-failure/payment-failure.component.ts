import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-failure',
  standalone: false,
  templateUrl: './payment-failure.component.html',
  styleUrls: ['./payment-failure.component.css']
})
export class PaymentFailureComponent implements OnInit {
  paymentId: string | null = null;
  error: string = 'Le paiement n\'a pas pu être complété.';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.queryParamMap.get('payment_id');

    if (this.paymentId) {
      this.getPaymentDetails();
    }
  }

  getPaymentDetails(): void {
    // Vérification TypeScript pour s'assurer que paymentId n'est pas null
    if (!this.paymentId) return;

    this.paymentService.verifyPayment(this.paymentId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Mettre à jour l'UI avec les détails si nécessaire
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des détails du paiement', err);
      }
    });
  }

  retry(): void {
    if (!this.paymentId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.paymentService.verifyPayment(this.paymentId).subscribe({
      next: (response) => {
        if (response.success && response.data?.contratNum) {
          this.router.navigate(['/contrat', response.data.contratNum, 'payment']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des détails pour réessayer', err);
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
