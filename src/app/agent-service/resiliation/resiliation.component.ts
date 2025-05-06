import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-resiliation',
  standalone: false,
  templateUrl: './resiliation.component.html',
  styleUrl: './resiliation.component.css'
})
export class ResiliationComponent {
  cancellationForm: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  private apiUrl = 'http://localhost:3000/contrat-auto-geteway/';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.cancellationForm = this.fb.group({
      cin: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      imat: ['', [Validators.required, this.validateImmatriculation]]
    });
  }

  validateImmatriculation(control: AbstractControl): {[key: string]: any} | null {
    const pattern = /^\d{1,4}TU\d{1,3}$/i;
    if (control.value && !pattern.test(control.value)) {
      return { 'invalidImmatriculation': true };
    }
    return null;
  }

  onSubmit() {
    if (this.cancellationForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    const { cin, imat } = this.cancellationForm.value;

    // Appel direct à l'API sans passer par le service
    this.http.post( `${this.apiUrl}resilier/${cin}/${imat}`,
    {}).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Le contrat a été résilié avec succès.';
        this.cancellationForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la résiliation du contrat.';
        console.error('Erreur de résiliation:', error);
      }
    });
  }
}
