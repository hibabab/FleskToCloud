import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface PaymentResponse {
  success: boolean;
  data?: {
    paymentLink?: string;
    paymentId?: string;
    trackingId?: string;
    amount?: number;
    expiration?: string;
    status?: string;
    contratNum?: number;
    paymentDate?: string;
  };
  message?: string;
  timestamp: string;
}

export interface PaymentRequest {
  contratNum: number;
  successUrl: string;
  failUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  /**
   * Génère un lien de paiement pour un contrat
   */
  generatePaymentLink(
    contratNum: number,
    successUrl: string = 'http://localhost:4200/dashboard-assure/payment/success',
    failUrl: string = 'http://localhost:4200/dashboard-assure/payment/failure'
  ): Observable<PaymentResponse> {
    const payload = {
      contratNum,
      successUrl,
      failUrl
    };

    console.log('Requête envoyée au serveur: ', payload);
    return this.http.post<PaymentResponse>(`${this.apiUrl}/payments/generate`, payload);
  }

   
// Ajoutez cette méthode dans PaymentService
cancelPayment(contratNum: number): Observable<PaymentResponse> {
  return this.http.delete<PaymentResponse>(`${this.apiUrl}/payments/cancel/${contratNum}`)
    .pipe(
      catchError(error => {
        console.error('Erreur lors de l\'annulation du paiement:', error);
        return throwError(() => error);
      })
    );
}
  /**
   * Vérifie le statut d'un paiement spécifique
   */
  verifyPayment(paymentId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/payments/verify/${paymentId}`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la vérification du paiement:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère le statut de paiement pour un contrat
   */
  getPaymentStatus(contratNum: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/payments/status/${contratNum}`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération du statut de paiement:', error);
          return throwError(() => error);
        })
      );
  }
}
