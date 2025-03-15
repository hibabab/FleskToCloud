import { Component, OnInit } from '@angular/core';
import { UserDto } from '../models/user-dto';
import { UserService } from '../services/user-service.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: UserDto = {
    email: '',
    password: '',
    nom: '',
    prenom: '',
    Cin: '',
    telephone: '',
    adresse: {
      rue: '',
      ville: '',
      pays: '',
      codePostal: ''
    },
    date_naissance: new Date()
  };

  constructor(private userService: UserService) {}

  // Fonction pour récupérer un cookie spécifique
  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  ngOnInit(): void {
    const token = this.getCookie('access_token');

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const userId = Number(decoded.sub); // Récupère l'ID utilisateur
        this.loadUserData(userId);
      } catch (error) {
        console.error('Erreur lors du décodage du token', error);
      }
    } else {
      console.error('Token JWT non trouvé');
    }
  }

  loadUserData(userId: number): void {
    this.userService.getUserById(userId).subscribe(
      (data: UserDto) => {
        this.user = data;
        console.log('Données utilisateur chargées', data);
      },
      (error) => {
        console.error('Erreur lors du chargement des données utilisateur', error);
      }
    );
  }
}
