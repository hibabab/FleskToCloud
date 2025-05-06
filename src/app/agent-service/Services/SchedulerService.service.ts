import { Injectable, OnDestroy } from '@angular/core';
import { NotificationService } from './notification.service';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService implements OnDestroy {
  private schedulerSubscription: Subscription | null = null;
  private readonly CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

  constructor(private notificationService: NotificationService) { }
  startScheduler(): void {
    if (this.schedulerSubscription) {
      return;
    }

    // Programme la vérification à exécuter chaque 24 heures
    this.schedulerSubscription = interval(this.CHECK_INTERVAL).subscribe(() => {
      this.checkExpirations();
    });

    // Exécute une première vérification immédiatement
    this.checkExpirations();
  }

  private checkExpirations(): void {
    console.log('Programmation de la vérification des expirations...');
    this.notificationService.checkExpirations().subscribe({
      next: () => console.log('Vérification des expirations effectuée avec succès'),
      error: (error) => console.error('Erreur lors de la vérification des expirations', error)
    });
  }

  /**
   * Arrêter le planificateur de vérification
   */
  stopScheduler(): void {
    if (this.schedulerSubscription) {
      this.schedulerSubscription.unsubscribe();
      this.schedulerSubscription = null;
    }
  }

  ngOnDestroy(): void {
    this.stopScheduler();
  }
}
