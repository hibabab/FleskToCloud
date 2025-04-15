import { Component, OnInit } from '@angular/core';
import { ConstatService } from '../Services/constat.service';

@Component({
  selector: 'app-constat-list',
  standalone: false,
  templateUrl: './constat-list.component.html',
  styleUrls: ['./constat-list.component.css']
})
export class ConstatListComponent implements OnInit {

  constats: any[] = [];
  experts: any[] = [];
  selectedExpert: any = null;
  newExpert = { nom: '', prenom: '', email: '' };

  showPopup = false;
  currentConstat: any;

  constructor(private constatService: ConstatService) { }

  ngOnInit(): void {
    // Récupération des constats
    this.constatService.getAllConstats().subscribe(
      (data) => {
        this.constats = data;
        console.log("Constats :", this.constats);
      },
      (error) => {
        console.error('Erreur lors de la récupération des constats:', error);
      }
    );

    // Récupération des experts
    this.constatService.getAllExperts().subscribe(
      (data) => {
        this.experts = data;
        console.log("Experts :", this.experts);
      },
      (error) => {
        console.error('Erreur lors de la récupération des experts:', error);
      }
    );
  }

  openPopup(constat: any) {
    this.currentConstat = constat;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedExpert = null;
    this.newExpert = { nom: '', prenom: '', email: '' };
  }

  assignExpert() {
    const expertAffecte = this.selectedExpert ?? this.newExpert;

    // TODO : Appel API pour associer expertAffecte à this.currentConstat
    console.log("Expert affecté :", expertAffecte, "au constat :", this.currentConstat);

    this.closePopup();
  }
 
interventionDate: string = '';
commentaire: string = '';

}
