import { Component, OnInit } from '@angular/core';
import { ConstatService } from '../services/constat.service';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-constat-list',
  standalone: false,
  templateUrl: './constat-list.component.html',
  styleUrls: ['./constat-list.component.css']
})
export class ConstatListComponent implements OnInit {
  constats: any[] = [];


  constructor(private constatService: ConstatService,
     private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchConstats(); // Appeler la méthode pour récupérer les constats lors du chargement du composant
  }
  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  fetchConstats(): void {
    const token = this.getCookie('access_token');

              if (token) {
                const decoded: any = jwtDecode(token); // Décode le token
                const userId = Number(decoded.sub);
    this.constatService.getConstatsByUser(userId).subscribe(
      (data: any[]) => {
        this.constats = data;
        console.log(data)

      },
      (error) => {
        console.error('Erreur lors de la récupération des constats', error);
      }
    );
  }
}
}
