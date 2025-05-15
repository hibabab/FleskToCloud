import { Component } from '@angular/core';
import { NotificationService } from '../../agent-service/Services/notification.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-publier',
  standalone: false,
  templateUrl: './publier.component.html',
  styleUrl: './publier.component.css'
})
export class PublierComponent {
  showSuccess = false;
  showError = false;
  successMessage = '';
  errorMessage = '';
  notificationMessage: string = '';
  notificationHistory: any[] = [
    {
      message: 'Rappel : Réunion hebdomadaire demain à 10h',
      date: new Date('2023-05-15'),
      status: 'Envoyé'
    },
    {
      message: 'Nouvelle politique de traitement des réclamations',
      date: new Date('2023-05-10'),
      status: 'Envoyé'
    }
  ];


  constructor(
    private http: HttpClient,
     private router: Router,
    private notificationService: NotificationService
  ) {}

  async sendNotificationToAgents() {
    if (!this.notificationMessage) return;

    try {
      const notificationResult = await this.notificationService.notifyAllUsers(
        this.notificationMessage,
        'admin-notification'
      ).toPromise();

      if (notificationResult) {
        // Ajouter à l'historique
        this.notificationHistory.unshift({
          message: this.notificationMessage,
          date: new Date(),
          status: 'Envoyé'
        });

        // Afficher le toast de succès
        this.showSuccessMessage('Notification envoyée avec succès !');

        // Réinitialiser le message
        this.notificationMessage = '';

        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/admin/interface']);
        }, 2000);
      } else {
        this.showErrorMessage('Échec de l\'envoi de la notification');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      this.showErrorMessage('Erreur lors de l\'envoi de la notification');
    }
  }

  private showSuccessMessage(message: string) {
    this.successMessage = message;
    this.showSuccess = true;
    this.showError = false;

    // Masquer automatiquement après 3 secondes
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }

  private showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    this.showSuccess = false;

    // Masquer automatiquement après 5 secondes
    setTimeout(() => {
      this.showError = false;
    }, 5000);
  }
}

