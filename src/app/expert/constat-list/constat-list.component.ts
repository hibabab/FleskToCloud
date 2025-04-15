import { Component } from '@angular/core';

@Component({
  selector: 'app-constat-list',
  standalone: false,
  templateUrl: './constat-list.component.html',
  styleUrl: './constat-list.component.css'
})
export class ConstatListComponent {
  showModal = false;
  selectedConstat: any = null;

  constats = [
    { id: 1, police: '123456', assure: 'Hiba Wakel', lieu: 'Tunis', date: '2024-04-01', statut: 'En attente' },
    { id: 2, police: '654321', assure: 'Ali Ben Ali', lieu: 'Sfax', date: '2024-04-03', statut: 'En cours' },
    { id: 3, police: '789123', assure: 'Noura Youssef', lieu: 'Nabeul', date: '2024-04-05', statut: 'Terminée' },
  ];

  enAttente: any[] = [];
  enCours: any[] = [];
  terminee: any[] = [];

  ngOnInit() {
    this.enAttente = this.constats.filter(c => c.statut === 'En attente');
    this.enCours = this.constats.filter(c => c.statut === 'En cours');
    this.terminee = this.constats.filter(c => c.statut === 'Terminée');
  }

  openModal(constat: any) {
    this.selectedConstat = constat;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  estimerMontant(constat: any) {
    alert(`Estimation pour : ${constat.assure}`);
  }
}
