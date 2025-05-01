import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

interface Adresse {
  rue: string;
  numMaison: string;
  ville: string;
  gouvernat: string;
  codePostal: string;
  pays: string;
}

interface User {
  id: number;
  nom: string;
  prenom: string;
  Cin: string;
  telephone: string;
  email: string;
  date_naissance: Date;
  role: string;
  isBlocked: boolean;
  adresse: Adresse | null;
}

interface AssureVie {
  numSouscription: string;
  situationProfessionnelle: string;
  revenuMensuel: number;
}

interface AssureVieComplet {
  assureVie: AssureVie;
  user: User;
  adresse: Adresse | null;
}

@Component({
  selector: 'app-liste-assure-vie',
  standalone: false,
  templateUrl: './liste-assure-vie.component.html',
  styleUrl: './liste-assure-vie.component.css'
})
export class ListeAssureVieComponent implements OnInit {
  assuresVie: AssureVieComplet[] = [];
  loading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';
  private searchTerms = new Subject<string>();

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadAssuresVie();

    // Configuration de la recherche avec debounce
    this.searchTerms.pipe(
      debounceTime(300),        // attendre 300ms après chaque frappe
      distinctUntilChanged(),   // ignorer si terme inchangé
      switchMap((term: string) => {
        this.loading = true;
        return this.http.get<AssureVieComplet[]>(`http://localhost:3000/assure-vie/search?cin=${term}`);
      })
    ).subscribe({
      next: (data) => {
        this.assuresVie = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la recherche: ' + err.message;
        this.loading = false;
      }
    });
  }

  search(): void {
    if (this.searchTerm.trim()) {
      this.searchTerms.next(this.searchTerm.trim());
    } else {
      this.loadAssuresVie(); // Recharger tous les assurés si la recherche est vide
    }
  }
  loadAssuresVie(): void {
    this.loading = true;
    this.http.get<AssureVieComplet[]>('http://localhost:3000/assure-vie/assures')
      .subscribe({
        next: (data) => {
          this.assuresVie = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des données: ' + err.message;
          this.loading = false;
        }
      });
  }

  get filteredAssures(): AssureVieComplet[] {
    return this.assuresVie.filter(assure =>
      assure.user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      assure.user.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      assure.user.Cin.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      assure.assureVie.numSouscription.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  formatAdresse(adresse: Adresse | null): string {
    if (!adresse) return 'Non renseignée';
    return `${adresse.numMaison} ${adresse.rue}, ${adresse.ville}, ${adresse.gouvernat}, ${adresse.codePostal}, ${adresse.pays}`;
  }}
