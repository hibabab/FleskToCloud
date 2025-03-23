import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interface-admin',
  standalone: false,
  templateUrl: './interface-admin.component.html',
  styleUrl: './interface-admin.component.css'
})
export class InterfaceAdminComponent implements OnInit {
  expertsCount: number = 0;
  agentsCount: number = 0;
  usersCount: number = 0;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchCounts();
  }

  fetchCounts() {
    // Récupérer le nombre d'experts
    this.http.get<number>('http://localhost:3000/expert/count').subscribe(
      (count) => { this.expertsCount = count; },
      (error) => { console.error('Erreur lors de la récupération du nombre d\'experts:', error); }
    );

    // Récupérer le nombre d'agents de service
    this.http.get<number>('http://localhost:3000/agent-service/count').subscribe(
      (count) => { this.agentsCount = count; },
      (error) => { console.error('Erreur lors de la récupération du nombre d\'agents de service:', error); }
    );

    // Récupérer le nombre d'utilisateurs
    this.http.get<number>('http://localhost:3000/user-gateway/users/count').subscribe(
      (count) => { this.usersCount = count; },
      (error) => { console.error('Erreur lors de la récupération du nombre d\'utilisateurs:', error); }
    );
  }

  navigateToAddExpert(): void {
    this.router.navigate(['/admin/Expert']);
  }

  navigateToAddAgent(): void {
    this.router.navigate(['/admin/agent-service']);
  }
}
