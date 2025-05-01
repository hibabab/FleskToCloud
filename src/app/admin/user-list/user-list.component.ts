// src/app/user-list/user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Interface User basée sur votre entité
export interface User {
  id: number;
  nom: string;
  prenom: string;
  Cin: string;
  telephone: string;
  email: string;
  date_naissance: Date;
  password: string;
  adresse: Adresse; // Supposons que Adresse est une interface définie ailleurs
  role: RoleEntity;
  isBlocked: boolean;
  users: User[] ;
  errorMessage: string ;
  successMessage: string ; // Supposons que RoleEntity est une interface définie ailleurs
}

export interface Adresse {
  // Définissez les propriétés de l'adresse ici
}

export interface RoleEntity {
  // Définissez les propriétés du rôle ici
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  standalone:false,
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  activeUsers: User[] = [];
  blockedUsers: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  searchMode: boolean = false;
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<User[]>('http://localhost:3000/auth/users').subscribe(
      (data: User[]) => {
        this.users = data;
        this.activeUsers = this.users.filter(user => !user.isBlocked);
        this.blockedUsers = this.users.filter(user => user.isBlocked);
      },
      (error) => {
        this.errorMessage = 'Erreur lors de la récupération des utilisateurs.';
        console.error('Erreur:', error);
      }
    );
  }

  searchUser(): void {
    if (!this.searchTerm.trim()) {
      this.resetSearch();
      return;
    }

    // Encoder le terme de recherche
    const encodedTerm = encodeURIComponent(this.searchTerm);

    this.http.get<User[]>(`http://localhost:3000/user-gateway/search/${encodedTerm}`).subscribe({
      next: (data: User[]) => {
        this.filteredUsers = data;
        this.searchMode = true;
        if (data.length === 0) {
          this.errorMessage = `Aucun utilisateur trouvé avec "${this.searchTerm}"`;
        } else {
          this.errorMessage = '';
        }
      },
      error: (error) => {
        this.filteredUsers = [];
        this.searchMode = true;
        if (error.status === 404) {
          this.errorMessage = `Aucun utilisateur trouvé avec "${this.searchTerm}"`;
        } else {
          this.errorMessage = 'Erreur lors de la recherche. Veuillez réessayer.';
          console.error('Erreur détaillée:', error);
        }
      }
    });
  }

  resetSearch(): void {
    this.searchTerm = '';
    this.searchMode = false;
    this.filteredUsers = [];
  }

  toggleBlockUser(user: User): void {
    const apiUrl = `http://localhost:3000/user-gateway/${user.id}/block`;
    const isBlocked = !user.isBlocked;

    this.http.put<User>(apiUrl, { isBlocked }).subscribe({
      next: (updatedUser) => {
        if (updatedUser) {
          user.isBlocked = updatedUser.isBlocked;

          if (this.searchMode) {
            // Mettre à jour dans filteredUsers
            const index = this.filteredUsers.findIndex(u => u.id === updatedUser.id);
            if (index !== -1) {
              this.filteredUsers[index] = updatedUser;
            }
          } else {
            // Mettre à jour dans activeUsers/blockedUsers
            if (updatedUser.isBlocked) {
              this.activeUsers = this.activeUsers.filter(u => u.id !== updatedUser.id);
              this.blockedUsers.push(updatedUser);
            } else {
              this.blockedUsers = this.blockedUsers.filter(u => u.id !== updatedUser.id);
              this.activeUsers.push(updatedUser);
            }
          }
        }
      },
      error: (error) => {
        console.error("Erreur lors de la mise à jour du statut:", error);
      }
    });
  }
}
