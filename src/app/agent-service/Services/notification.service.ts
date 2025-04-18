import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: Date;
  type?: string;
  status?: string;
  metadata?: any;
  user?: any;
  processedByAgent?: any;
  link?: string;
  contractId?: number;
}

export interface SubscriptionRequest {
  user: any;
  formData: any;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/notificationgatway'; // API Gateway

  constructor(private http: HttpClient) {}

  // Méthodes principales correspondant au backend
  getNotifications(userId: number): Observable<Notification[]> {
    return this.http.post<Notification[]>(`${this.apiUrl}/get`, { userId });
  }

  createNotification(userId: number, message: string): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/create`, { userId, message });
  }

  notifyAllUsers(message: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notify-all`, { message });
  }

  createSubscriptionRequest(user: any, formData: any): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/subscription-request`, {
      user,
      formData
    });
  }

  getPendingSubscriptionRequests(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/pending-subscription-requests`);
  }

  processSubscriptionRequest(
    agent: any,
    notificationId: number,
    decision: 'accept' | 'reject'
  ): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/process-subscription-request`, {
      agent,
      notificationId,
      decision
    });
  }

  getNotificationDetails(notificationId: number): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/notification/${notificationId}`);
  }

  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/mark-as-read`, { notificationId });
  }
  markMultipleAsRead(notificationIds: number[]): Observable<Notification[]> {
    return this.http.post<Notification[]>(`${this.apiUrl}/mark-multiple-as-read`, { notificationIds });
  }

  getUnreadNotifications(userId: number): Observable<Notification[]> {
    return this.http.post<Notification[]>(`${this.apiUrl}/get-unread`, { userId });
  }

  // Méthode complete pour l'envoi de notification avec tous les paramètres possibles
  sendNotification(data: {
    userId: number;
    message: string;
    type?: string;
    link?: string;
    contractId?: number;
    metadata?: any;
  }): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/notifications`, data);
  }

  // Méthodes utilitaires pour la gestion côté client
  filterNotificationsByType(notifications: Notification[], type: string): Notification[] {
    return notifications.filter(notification => notification.type === type);
  }

  filterNotificationsByStatus(notifications: Notification[], status: string): Notification[] {
    return notifications.filter(notification => notification.status === status);
  }

  sortNotificationsByDate(notifications: Notification[]): Notification[] {
    return [...notifications].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getUnreadCount(notifications: Notification[]): number {
    return notifications.filter(notification => !notification.isRead).length;
  }
  
sendPaymentSuccessNotification(data: {
  contractId: number;
  agentId: number;
  contractNumber: string | number;
}): Observable<Notification> {
  return this.http.post<Notification>(`${this.apiUrl}/payment-success-notification`, data);
}
}
