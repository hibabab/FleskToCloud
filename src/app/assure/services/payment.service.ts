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
cancelPayment(contratNum: number): Observable<any> {
  // Changez DELETE en POST pour correspondre à l'implémentation du backend
  return this.http.post<any>(`${this.apiUrl}/payments/cancel/${contratNum}`, {});
}
cancel(contratNum: number): Observable<any> {
  // Changez DELETE en POST pour correspondre à l'implémentation du backend
  return this.http.post<any>(`${this.apiUrl}/payments/cancelP/${contratNum}`, {});
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
  generatePaymentLinkVie(
    contratNum: number,
    successUrl: string = 'http://localhost:4200/dashboard-assure/payment/success',
    failUrl: string = 'http://localhost:4200/dashboard-assure/payment/failure'
  ): Observable<PaymentResponse> {
    const payload = {
      contratNum,
      successUrl,
      failUrl
    };

    return this.http.post<PaymentResponse>(`${this.apiUrl}/payments/vie/generate`, payload)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la génération du lien de paiement vie:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Crée un paiement local pour un contrat vie
   */
  createLocalPaymentVie(contratNum: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/vie/local`, { contratNum })
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la création du paiement local vie:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Vérifie le statut d'un paiement vie spécifique
   */
  verifyPaymentVie(paymentId: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/payments/vie/verify/${paymentId}`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la vérification du paiement vie:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Récupère le statut de paiement pour un contrat vie
   */
  getPaymentStatusVie(contratNum: number): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/payments/vie/status/${contratNum}`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération du statut de paiement vie:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Annule un paiement vie
   */
  cancelPaymentVie(contratNum: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/payments/vie/cancel/${contratNum}`, {})
      .pipe(
        catchError(error => {
          console.error('Erreur lors de l\'annulation du paiement vie:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Initie un nouveau paiement vie
   */
  initiatePaymentVie(
    contratNum: number,
    successUrl: string = 'http://localhost:4200/dashboard-assure/payment/success',
    failUrl: string = 'http://localhost:4200/dashboard-assure/payment/failure'
  ): Observable<PaymentResponse> {
    const payload = {
      successUrl,
      failUrl
    };

    return this.http.post<PaymentResponse>(`${this.apiUrl}/payments/vie/initiate/${contratNum}`, payload)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de l\'initiation du paiement vie:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Méthodes génériques (conservées pour compatibilité)
   */

}
