import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  processDocument(
    formData: FormData,
    country: string,
    docType: string,
    detectFields: boolean
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/process_direct`, formData, {
      params: {
        country,
        doc_type: docType,
        detect_fields: detectFields.toString()
      }
    });
  }
}
