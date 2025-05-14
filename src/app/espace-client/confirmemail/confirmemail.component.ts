import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthentificationService } from '../services/authentification.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-confirmemail',
  templateUrl: './confirmemail.component.html',
  standalone: false,
  styleUrls: ['./confirmemail.component.css']
})
export class ConfirmemailComponent implements OnInit {
  email: string = '';
  codeArray: string[] = Array(6).fill('');
  formSubmitted: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthentificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      console.log('Email reçu depuis l’URL :', this.email);
    });
  }

  get isCodeComplete(): boolean {
    return this.codeArray.every(digit => digit && digit.trim() !== '');
  }

  onCodeInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, ''); // autorise uniquement les chiffres
    this.codeArray[index] = input.value;

    // Focus automatique sur le champ suivant
    if (input.value && index < this.codeArray.length - 1) {
      const nextInput = document.getElementById(`code${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.email && this.isCodeComplete) {
      this.isLoading = true;
      const verificationCode = this.codeArray.join('');

      this.authService.confirmEmail(this.email, verificationCode).subscribe({
        next: () => {
            this.isLoading = false;
            this.successMessage = 'Félicitations, vous êtes inscrit !';
            this.router.navigate(['/espace-client/login']);
        },
        error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Échec de la confirmation. Veuillez réessayer.';
            console.error('Erreur de confirmation :', error);
        }
    });
    }
  }

  hasPartialCode(): boolean {
    return this.codeArray.some(digit => digit && digit.trim() !== '');
  }
}
