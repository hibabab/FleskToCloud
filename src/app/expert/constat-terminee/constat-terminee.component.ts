import { Component } from '@angular/core';

@Component({
  selector: 'app-constat-terminee',
  standalone: false,
  templateUrl: './constat-terminee.component.html',
  styleUrl: './constat-terminee.component.css'
})
export class ConstatTermineeComponent {
  constatsTermines = [
    { id: 1, police: '123456', assure: 'Hiba Wakel', lieu: 'Tunis', date: '2024-04-01', statut: 'Terminée', rapportPdf: 'assets/reports/Rapport_123456.pdf' },
    { id: 2, police: '654321', assure: 'Ali Ben Ali', lieu: 'Sfax', date: '2024-04-03', statut: 'Terminée', rapportPdf: 'assets/reports/Rapport_654321.pdf' },
    { id: 3, police: '789123', assure: 'Noura Youssef', lieu: 'Nabeul', date: '2024-04-05', statut: 'Terminée', rapportPdf: 'assets/reports/Rapport_789123.pdf' },
  ]
}