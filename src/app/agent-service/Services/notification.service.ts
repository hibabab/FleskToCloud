import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id?: number;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/notificationgatway'; // API Gateway

  constructor(private http: HttpClient) {}

  getNotifications(userId: number): Observable<Notification[]> {
    return this.http.post<Notification[]>(`${this.apiUrl}/get`, { userId });
  }
  

 
}
