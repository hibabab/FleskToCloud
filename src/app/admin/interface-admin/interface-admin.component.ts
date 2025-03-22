import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interface-admin',
  standalone: false,
  templateUrl: './interface-admin.component.html',
  styleUrl: './interface-admin.component.css'
})
export class InterfaceAdminComponent {
  constructor(private router: Router) {}
  navigateToAddExpert(): void {
    this.router.navigate(['/admin/Expert']);
  }

  navigateToAddAgent(): void {
    this.router.navigate(['/admin/agent-service']);
  }
  experts: any[] = [];
  agents: any[] = [];
  users: any[] = [];
  assures: any[] = [];
  toggleBlock(userId: string) {}
    showUserListFlag: boolean = false; // Déclarer la propriété ici

    // Méthode pour afficher la liste des utilisateurs
    showUserList() {
      this.showUserListFlag = true;
    }

  }

