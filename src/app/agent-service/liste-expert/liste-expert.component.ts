import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-liste-expert',
  standalone: false,
  templateUrl: './liste-expert.component.html',
  styleUrl: './liste-expert.component.css'
})
export class ListeExpertComponent {
  experts: any[] = [];
  filteredExperts: any[] = [];
  selectedSpecialite: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllExperts();
  }

  loadAllExperts(): void {
    this.http.get<any[]>('http://localhost:3000/expert').subscribe(
      (data) => {
        this.experts = data;
        this.filteredExperts = [...this.experts];
      },
      (error) => {
        console.error('Erreur lors de la récupération des experts:', error);
      }
    );
  }

  filterExpertsBySpecialite(): void {
    if (!this.selectedSpecialite) {
      this.filteredExperts = [...this.experts];
    } else {
      this.http.get<any[]>(`http://localhost:3000/expert/specialite/${this.selectedSpecialite}`).subscribe(
        (data) => {
          this.filteredExperts = data;
        },
        (error) => {
          console.error(`Erreur lors de la récupération des experts avec la spécialité ${this.selectedSpecialite}:`, error);
          this.filteredExperts = [];
        }
      );
    }
  }

  getSpecialiteLabel(value: string): string {
    const specialites = [
      { value: 'vehicule_lourd_et_leger', label: 'Véhicule lourd et léger' },
      { value: 'mecanique_generale', label: 'Mécanique générale' },
      { value: 'incendie', label: 'Incendie' },
      { value: 'batiment', label: 'Bâtiment' },
      { value: 'genie_civil', label: 'Génie civil' },
      { value: 'informatique_et_machine_electronique', label: 'Informatique et machine électronique' },
      { value: 'commissaire_davarie', label: 'Commissaire d\'avarie' },
      { value: 'medical', label: 'Médical' },
      { value: 'evaluation_degats_corpels', label: 'Évaluation de dégâts corporels d\'accident de circulation' },
      { value: 'perte_exploitation_incendie', label: 'Perte d\'exploitation après incendie' },
      { value: 'electricite', label: 'Électricité' },
      { value: 'alimentation_et_industrie_alimentaire', label: 'Alimentation et industrie alimentaire' },
      { value: 'finances', label: 'Finances' },
      { value: 'electrique_navires', label: 'Électrique de navires' },
      { value: 'corps_navire_maritime', label: 'Corps de navire maritime' },
      { value: 'autre', label: 'Autre' }
    ];

    const found = specialites.find(item => item.value === value);
    return found ? found.label : value;
  }
}
