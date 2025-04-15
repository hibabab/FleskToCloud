import { Component, OnInit } from '@angular/core';
import { ConstatService } from '../Services/constat.service';

@Component({
  selector: 'app-constat-list',
  standalone:false,
  templateUrl: './constat-list.component.html',
  styleUrls: ['./constat-list.component.css']
})
export class ConstatListComponent implements OnInit {
  

  constats: any[] = [];
  experts: any[] = [];
  selectedExpertId: number | null = null;
  showPopup = false;
  currentConstat: any;
  commentaire: string = '';
  affectedConstats = new Map<number, boolean>(); // Map pour suivre les constats affectés

  constructor(private constatService: ConstatService) { }

  ngOnInit(): void {
    this.loadConstats();
    this.loadExperts();
  }
  loadConstats(): void {
    this.constatService.getAllConstats().subscribe({
      next: (data) => {
        this.constats = data;
        
        // Réinitialiser la map
        this.affectedConstats.clear();
        
        // Marquer les constats qui ont un expert comme affectés
        data.forEach((constat: any) => {
          const hasExpert = Boolean(constat.expert);
          this.affectedConstats.set(constat.idConstat, hasExpert);
        });
        
        console.log("Map des constats affectés:", Array.from(this.affectedConstats.entries()));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des constats:', error);
      }
    });
  }
  assignExpert(): void {
    if (!this.selectedExpertId || !this.currentConstat) {
      console.error("Sélection invalide");
      return;
    }
  
    const agentId = 1; // À remplacer par l'ID réel de l'agent
  
    this.constatService.affecterExpert(
      this.selectedExpertId, 
      this.currentConstat.idConstat, 
      agentId,
      this.commentaire
    ).subscribe({
      next: (res) => {
        console.log("Succès:", res);
        this.closePopup();
        alert("Expert affecté avec succès !");
        
        // Recharger les constats pour s'assurer que les données sont à jour
        this.loadConstats();
      },
      error: (err) => {
        console.error("Erreur:", err);
      }
    });
  }
  loadExperts(): void {
    this.constatService.getAllExperts().subscribe({
      next: (data) => {
        this.experts = data;
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }

  openPopup(constat: any): void {
    console.log("Ouverture popup pour constat:", constat);
    this.currentConstat = constat;
    this.selectedExpertId = null;
    this.commentaire = '';
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }

  
}