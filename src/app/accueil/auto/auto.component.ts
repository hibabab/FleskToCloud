import { Component } from '@angular/core';

@Component({
  selector: 'app-auto',
  standalone: false,
  templateUrl: './auto.component.html',
  styleUrls: ['./auto.component.css']
})
export class AutoComponent {
  garanties = [
    { nom: "Responsabilité civile", essentielle: true, dommagesCollision: true, tousRisques: true },
    { nom: "RTI", essentielle: true, dommagesCollision: true, tousRisques: true },
    { nom: "Défense et Recours (CAS)", essentielle: true, dommagesCollision: true, tousRisques: true },
    { nom: "Incendie", essentielle: true, dommagesCollision: true, tousRisques: true },
    { nom: "Vol", essentielle: true, dommagesCollision: true, tousRisques: true },
    { nom: "Accident corporel du conducteur", essentielle: true, dommagesCollision: true, tousRisques: true },
    { nom: "Personnes Transportées (PTA)", essentielle: true, dommagesCollision: true, tousRisques: true },
    { nom: "Assistance Automobile", essentielle: true, dommagesCollision: true, tousRisques: true },
    { nom: "Événements climatiques", essentielle: false, dommagesCollision: true, tousRisques: true },
    { nom: "Grèves, émeutes et mouvements populaires", essentielle: false, dommagesCollision: true, tousRisques: true },
    { nom: "Bris de glace", essentielle: true, dommagesCollision: true, tousRisques: true },
    { nom: "Dommages Collision", essentielle: false, dommagesCollision: true, tousRisques: false },
    { nom: "Dommages Tierce", essentielle: false, dommagesCollision: false, tousRisques: true }
  ];

  // Objet pour stocker l'état d'ouverture des questions
  isOpen: { [key: number]: boolean } = {};

  // Fonction pour basculer l'affichage de la réponse
  toggleAnswer(questionId: number): void {
    this.isOpen[questionId] = !this.isOpen[questionId];
  }
}
