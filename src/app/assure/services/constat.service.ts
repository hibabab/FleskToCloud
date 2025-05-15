// constat.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ConstatService {
  private apiUrl = 'http://localhost:3000'; // L'URL de base de l'API

  constructor(private http: HttpClient) {}

  getAllConstats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/constat/get_all_constats`).pipe(
      tap(constats => console.log('📄 Constats chargés:', constats.length)),
      catchError(this.handleError)
    );
  }

  getConstatsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/constat/get_constat_by_user/${userId}`).pipe(
      tap(constats => console.log(`👤 Constats pour l’utilisateur ${userId} :`, constats.length)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ Erreur HTTP:', {
      status: error.status,
      url: error.url,
      message: error.message,
    });

    let errorMessage = 'Erreur inconnue';
    if (error.status === 0) {
      errorMessage = 'Serveur inaccessible (CORS ou problème réseau)';
    } else if (error.status === 404) {
      errorMessage = '🔍 Endpoint non trouvé. Vérifiez :';
      errorMessage += `\n- URL : ${error.url}`;
      errorMessage += `\n- Méthode : ${error.type}`;
    } else {
      errorMessage = `Erreur ${error.status} : ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }

  // Mise à jour de la méthode d'upload pour corriger l'URL
 // Mettez à jour la méthode createConstat
createConstat(immatriculation: string, formData: FormData): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/constat/create-constat/${immatriculation}`,
    formData
  ).pipe(
    tap(() => console.log('✅ Constat créé avec succès')),
    catchError(this.handleError)
  );
}

// Et la méthode uploadConstatPDF
uploadConstatPDF(constatId: number, file: Blob): Observable<any> {
  const formData = new FormData();
  formData.append('file', file, 'constat.pdf');

  return this.http.post(
    `${this.apiUrl}/constat/upload-constat-file/${constatId}`,
    formData
  ).pipe(
    tap(() => console.log('📤 PDF envoyé avec succès')),
    catchError(this.handleError)
  );
}
}
