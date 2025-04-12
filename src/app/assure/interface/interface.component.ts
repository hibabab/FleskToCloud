import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserDto } from '../../espace-client/models/userDto';
@Component({
  selector: 'app-interface',
  standalone: false,
  templateUrl: './interface.component.html',
  styleUrl: './interface.component.css'
})
export class InterfaceComponent implements OnInit {
  user: UserDto | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.loadUserDataFromToken();
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  loadUserDataFromToken(): void {
    const token = this.getCookie('access_token');

    if (!token) {
      this.errorMessage = 'Session invalide. Veuillez vous reconnecter.';
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const userId = Number(decoded.sub);

      if (!userId) {
        this.errorMessage = 'Impossible de récupérer l\'ID utilisateur';
        return;
      }

      this.fetchUserData(userId);
    } catch (error) {
      this.errorMessage = 'Erreur de décodage du token';
      console.error('Erreur de décodage:', error);
    }
  }

  fetchUserData(userId: number): void {
    this.isLoading = true;

    this.http.get<UserDto>(`http://localhost:3000/auth/users/${userId}`).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.user = user;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la récupération des données utilisateur';
        console.error('Erreur:', err);
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
