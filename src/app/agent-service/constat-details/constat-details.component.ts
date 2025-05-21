// constat-details.component.ts 
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ConstatService } from '../../assure/services/constat.service';


@Component({
  selector: 'app-constat-details',
  standalone: false,
  templateUrl: './constat-details.component.html',
  styleUrls: ['./constat-details.component.css']
})
export class ConstatDetailsComponent implements OnInit {
  @Input() constatId!: number;
  @Output() close = new EventEmitter<void>();
  
  constatDetails: any;
  loading = true;
  activeTab: 'conducteur' | 'temoins' | 'photos' | 'circonstances' = 'conducteur';

  setActiveTab(tab: 'conducteur' | 'temoins' | 'photos' | 'circonstances'): void {
    this.activeTab = tab;
  }

  constructor(private constatService: ConstatService) {}

  ngOnInit(): void {
    if (this.constatId) {
      this.loadConstatDetails();
    }
  }

  loadConstatDetails(): void {
    this.loading = true;
    this.constatService.getConstatDetails(this.constatId).subscribe({
      next: (data) => {
        this.constatDetails = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails:', err);
        this.loading = false;
      }
    });
  }
  
  closeDialog(): void {
    this.close.emit();
  }
}