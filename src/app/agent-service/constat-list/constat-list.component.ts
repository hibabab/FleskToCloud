import { Component, OnInit } from '@angular/core';
import { ConstatService } from '../Services/constat.service';
import { jwtDecode } from 'jwt-decode';

export enum ConstatStatut {
  EN_ATTENTE = 'En attente',
  AFFECTE = 'Expert assigné',
  EN_COURS = 'Expertise en cours',
  ESTIME = 'ESTIMÉ',
  CLOTURE = 'Clôturé',
}

@Component({
  selector: 'app-constat-list',
  standalone: false,
  templateUrl: './constat-list.component.html',
  styleUrls: ['./constat-list.component.css']
})
export class ConstatListComponent implements OnInit {
 
    constats: any[] = [];
    filteredConstats: any[] = []; // Pour stocker les constats filtrés
    experts: any[] = [];
    selectedExpertId: number | null = null;
    showExpertPopup = false;
    showEstimationPopup = false;
    currentConstat: any;
    commentaire: string = '';
    affectedConstats = new Map<number, boolean>();
    userId: number | null = null;
    agentId: number | null = null;
    estimationMode: 'estimation' | 'ajustement' = 'estimation';
    
    // Filtres
    searchImmatriculation: string = '';
    selectedStatut: string | null = null;
    statutOptions = Object.values(ConstatStatut);
    
  selectedConstatId: number | null = null;
  showDetails = false;
    
    // Estimation data
    estimationData = {
      description: '',
      montant: 0,
      commentaire: ''
    };
  
    constructor(private constatService: ConstatService) { }
  
    ngOnInit(): void {
      this.decodeUserIdFromToken();
    }
  
    private decodeUserIdFromToken(): void {
      const token = this.getCookie('access_token');
      if (!token) {
        console.error('Token non trouvé');
        return;
      }
  
      try {
        const decoded: any = jwtDecode(token);
        this.userId = Number(decoded.sub);
        this.fetchAgentIdAndLoadData();
      } catch (error) {
        console.error('Erreur lors du décodage du token :', error);
      }
    }
  
    private fetchAgentIdAndLoadData(): void {
      if (!this.userId) return;
  
      this.constatService.getAgentIdByUserId(this.userId).subscribe({
        next: (id) => {
          this.agentId = id;
          this.loadConstats();
          this.loadExperts();
        },
        error: (err) => {
          console.error("Erreur lors de la récupération de l'ID agent :", err);
        }
      });
    }
  
    private getCookie(name: string): string | null {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    }
    
    loadConstats(): void {
      this.constatService.getAllConstats().subscribe({
        next: (data) => {
          // Transformation des données si nécessaire
          this.constats = data.map((constat: any) => {
            // Ajout des propriétés nécessaires pour l'affichage
            return {
              ...constat,
              numeroPolice: constat.vehicule?.contratAuto?.num || 'Non défini',
              expert: constat.expert || null,
              estimation: {
                description: '',
                montant: constat.montantEstime || 0,
                commentaire: ''
              }
            };
          });
          
          console.log('Constats transformés:', this.constats);
          
          this.affectedConstats.clear();
          data.forEach((constat: any) => {
            const hasExpert = Boolean(constat.expert);
            this.affectedConstats.set(constat.idConstat, hasExpert);
          });
          
          // Appliquer les filtres après chargement des données
          this.applyFilters();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des constats:', error);
        }
      });
    }
    
    // Méthode pour appliquer les filtres
    applyFilters(): void {
      this.filteredConstats = this.constats.filter(constat => {
        // Filtre par immatriculation si la recherche n'est pas vide
        const matchImmat = !this.searchImmatriculation || 
          (constat.vehicule?.immatriculation && 
           constat.vehicule.immatriculation.toLowerCase().includes(this.searchImmatriculation.toLowerCase()));
        
        // Filtre par statut si un statut est sélectionné
        const matchStatut = !this.selectedStatut || constat.statut === this.selectedStatut;
        
        return matchImmat && matchStatut;
      });
    }
  
    assignExpert(): void {
      if (!this.selectedExpertId || !this.currentConstat || !this.agentId) {
        console.error("Sélection invalide ou agent non identifié");
        return;
      }
      
      this.constatService.affecterExpert(
        this.selectedExpertId, 
        this.currentConstat.idConstat, 
        this.agentId,
        this.commentaire
      ).subscribe({
        next: (res) => {
          console.log("Succès:", res);
          this.closePopup();
          alert("Expert affecté avec succès !");
          this.loadConstats(); // Recharge la liste pour mettre à jour les statuts
        },
        error: (err) => {
          console.error("Erreur:", err);
          alert("Erreur lors de l'affectation de l'expert");
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
  
    openExpertPopup(constat: any): void {
      this.currentConstat = constat;
      this.selectedExpertId = null;
      this.commentaire = '';
      this.showExpertPopup = true;
    }
  
    openEstimationPopup(constat: any, mode: 'estimation' | 'ajustement'): void {
      this.currentConstat = constat;
      this.estimationMode = mode;
      this.resetEstimationData();
      
      // Si des valeurs existantes sont disponibles, les pré-remplir
      if (constat.montantEstime) {
        this.estimationData.montant = constat.montantEstime || 0;
      }
      
      this.showEstimationPopup = true;
    }
  
    closePopup(): void {
      this.showExpertPopup = false;
      this.showEstimationPopup = false;
    }
    
    private resetEstimationData(): void {
      this.estimationData = {
        description: '',
        montant: 0,
        commentaire: ''
      };
    } 

    validerEstimation(): void {
      if (!this.currentConstat || !this.estimationData.description || !this.estimationData.montant) {
        console.error("Données d'estimation incomplètes");
        alert("Veuillez remplir tous les champs obligatoires");
        return;
      }
      
      if (!this.agentId) {
        console.error("Agent non identifié");
        alert("Erreur d'identification de l'agent");
        return;
      }
    
      this.constatService.estimerMontantParAgent(
        this.currentConstat.idConstat,
        this.agentId,
        this.estimationData.montant,
        this.estimationData.description,
        this.estimationData.commentaire,
      ).subscribe({
        next: (res) => {
          console.log("Estimation validée:", res);
          this.closePopup();
          
          // Afficher un message différent selon le mode
          const message = this.estimationMode === 'ajustement' 
            ? "Montant ajusté avec succès !" 
            : "Estimation enregistrée avec succès !";
          alert(message);
          
          this.loadConstats(); // Recharge la liste pour mettre à jour les statuts
          this.resetEstimationData();
        },
        error: (err) => {
          console.error("Erreur lors de l'estimation:", err);
          alert(`Erreur: ${err.error?.message || "Erreur lors de l'enregistrement de l'estimation"}`);
        }
      });
    }
     viewDetails(constatId: number): void {
    this.selectedConstatId = constatId;
    this.showDetails = true;
  }

  headers = [
    'N° Police',
    'Date',
    'Adresse',
    'Statut',
    'Montant',
    'Résumé',
    'Détails',
    'Action'
  ];


  // Typage explicite pour les statuts
  statusStyles: Record<string, string> = {
    'En attente': 'bg-amber-100 text-amber-800',
    'Expert assigné': 'bg-blue-100 text-blue-800',
    'Expertise en cours': 'bg-indigo-100 text-indigo-800',
    'ESTIMÉ': 'bg-emerald-100 text-emerald-800',
    'Clôturé': 'bg-gray-100 text-gray-800',
    'default': 'bg-gray-100 text-gray-800'
  };
 hideConstatDetails(): void {
    this.showDetails = false;
    this.selectedConstatId = null;
  }
  statusIcons: Record<string, string> = {
    'En attente': 'fas fa-clock',
    'Expert assigné': 'fas fa-user-tie',
    'Expertise en cours': 'fas fa-microscope',
    'ESTIMÉ': 'fas fa-check-circle',
    'Clôturé': 'fas fa-lock'
  };
  closeDetails(): void {
    this.showDetails = false;
    this.selectedConstatId = null;
  }
  // Variables pour les filtres, le tri et la sélection
selectedSpecialite: string = '';
searchCompetence: string = '';
sortCriteria: string = 'competenceDesc'; // Tri par défaut

filteredExperts: any[] = []; // Experts après filtrage et tri

// Méthode pour filtrer et trier les experts
filterExperts(): void {
  // 1. Filtrage
  this.filteredExperts = this.experts.filter(expert => {
    // Filtre par spécialité
    const matchSpecialite = !this.selectedSpecialite || 
      expert.specialite === this.selectedSpecialite;
    
    // Filtre par mot-clé de compétence
    const matchCompetence = !this.searchCompetence || 
      (expert.competences && expert.competences.some((comp: string) => 
        comp.toLowerCase().includes(this.searchCompetence.toLowerCase())
      ));
    
    return matchSpecialite && matchCompetence;
  });
  
  // 2. Tri
  this.filteredExperts.sort((a, b) => {
    switch(this.sortCriteria) {
      case 'competenceDesc':
        return b.competence - a.competence;
      case 'competenceAsc':
        return a.competence - b.competence;
      case 'experienceDesc':
        return b.nbAnneeExperience - a.nbAnneeExperience;
      case 'experienceAsc':
        return a.nbAnneeExperience - b.nbAnneeExperience;
      case 'nom':
        return (a.user?.nom || '').localeCompare(b.user?.nom || '');
      default:
        return 0;
    }
  });
}

// Sélectionner un expert
selectExpert(expertId: number): void {
  this.selectedExpertId = expertId;
}

// Ajouter dans la classe Component
private readonly specialiteLabels = {
  vehicule_lourd_et_leger: 'Véhicule lourd et léger',
  mecanique_generale: 'Mécanique générale',
  incendie: 'Incendie',
  medical: 'Médical',
  evaluation_degats_corpels: 'Dégâts corporels (accidents)',
  finances: 'Finances',
  autre: 'Autre'
};

getSpecialiteLabel(specialite: string): string {
  return this.specialiteLabels[specialite as keyof typeof this.specialiteLabels] || specialite;
}
}