import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-accueil',
  standalone: false,
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent {
  isPlayingAuto = false; // Vidéo Auto en pause par défaut
  isPlayingVie = false;  // Vidéo Vie en pause par défaut

  // Références aux éléments vidéo dans le template
  @ViewChild('videoAuto') videoAuto!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoVie') videoVie!: ElementRef<HTMLVideoElement>;

  // Fonction pour mettre en pause ou reprendre la vidéo
  toggleVideo(type: string) {
    if (type === 'auto') {
      const video = this.videoAuto.nativeElement;
      if (video.paused) {
        video.play();
        this.isPlayingAuto = true;
      } else {
        video.pause();
        this.isPlayingAuto = false;
      }
    } else if (type === 'vie') {
      const video = this.videoVie.nativeElement;
      if (video.paused) {
        video.play();
        this.isPlayingVie = true;
      } else {
        video.pause();
        this.isPlayingVie = false;
      }
    }
  }

  // Après l'initialisation de la vue, assurez-vous que les vidéos sont en pause
  ngAfterViewInit() {
    this.videoAuto.nativeElement.pause();
    this.videoVie.nativeElement.pause();
  }
}



