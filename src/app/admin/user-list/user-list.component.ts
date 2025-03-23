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
  users: User[] = []; // Tableau pour stocker tous les utilisateurs
  activeUsers: User[] = []; // Tableau pour stocker les utilisateurs actifs
  blockedUsers: User[] = []; // Tableau pour stocker les utilisateurs bloqués
  errorMessage: string = ''; // Propriété pour stocker le message d'erreur

  constructor(private http: HttpClient) {} // Injectez HttpClient

  ngOnInit(): void {
    this.loadUsers(); // Chargez les utilisateurs au démarrage du composant
  }

  // Méthode pour charger les utilisateurs
  loadUsers(): void {
    const apiUrl = 'http://localhost:3000/auth/users'; // URL du backend

    this.http.get<User[]>(apiUrl).subscribe(
      (data: User[]) => {
        this.users = data; // Affectez les données reçues au tableau users

        // Séparer les utilisateurs actifs et bloqués
        this.activeUsers = this.users.filter(user => !user.isBlocked);
        this.blockedUsers = this.users.filter(user => user.isBlocked);
      },
      (error) => {
        this.errorMessage = 'Erreur lors de la récupération des utilisateurs.'; // Message d'erreur
        console.error('Erreur:', error);
      }
    );
  }

  toggleBlockUser(user: User): void {
    if (!user || !user.id) {
      console.error("L'utilisateur ou son ID est invalide.");
      return;
    }

    const apiUrl = `http://localhost:3000/user-gateway/${user.id}/block`; // URL de la passerelle
    const isBlocked = typeof user.isBlocked === 'boolean' ? !user.isBlocked : false; // Inverser le statut

    this.http.put<User>(apiUrl, { isBlocked }).subscribe({
      next: (updatedUser) => {
        if (updatedUser) {
          user.isBlocked = updatedUser.isBlocked; // Mettre à jour le statut local

          // Mettre à jour les tableaux activeUsers et blockedUsers
          if (updatedUser.isBlocked) {
            this.activeUsers = this.activeUsers.filter(u => u.id !== updatedUser.id);
            this.blockedUsers.push(updatedUser);
          } else {
            this.blockedUsers = this.blockedUsers.filter(u => u.id !== updatedUser.id);
            this.activeUsers.push(updatedUser);
          }

          console.log(
            `Utilisateur ${updatedUser.nom} ${updatedUser.prenom} a été ${updatedUser.isBlocked ? 'bloqué' : 'débloqué'}.`
          );
        }
      },
      error: (error) => {
        console.error("Erreur lors de la mise à jour du statut de l'utilisateur :", error);

        if (error.status === 404) {
          console.error(`L'utilisateur avec l'ID ${user.id} est introuvable.`);
        } else if (error.status === 400) {
          console.error("Requête invalide. Vérifiez les données envoyées.");
        } else {
          console.error("Une erreur inattendue est survenue.");
        }
      }
    });
  }
}
