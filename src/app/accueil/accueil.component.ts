import { Component } from '@angular/core';

@Component({
  selector: 'app-accueil',
  standalone: false,
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent {
  showOffres = true;
  showDevis = false;
  showClient = false;

  toggleDescription(section: string) {
    // Réinitialiser toutes les sections à false
    this.showOffres = this.showDevis = this.showClient = false;

    // Afficher la section cliquée
    if (section === 'offres') {
      this.showOffres = true;
    } else if (section === 'devis') {
      this.showDevis = true;
    } else if (section === 'client') {
      this.showClient = true;
    }
  }
}