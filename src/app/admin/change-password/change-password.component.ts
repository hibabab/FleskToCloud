import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  standalone:false,
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null : { 'passwordMismatch': true };
  }

  onSubmit() {
    if (this.changePasswordForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      currentPassword: this.changePasswordForm.value.currentPassword,
      newPassword: this.changePasswordForm.value.newPassword
    };

    this.http.put('http://localhost:3000/admin-gateway/1/change-password', payload)
      .subscribe({
        next: () => {
          this.successMessage = 'Mot de passe changé avec succès!';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/admin/interface']), 2000);
        },
        error: (error) => {
          this.isSubmitting = false;
          if (error.status === 400) {
            this.errorMessage = error.error.message || 'Mot de passe actuel incorrect';
          } else {
            this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
          }
          console.error('Erreur:', error);
        }
      });
  }

  resetForm() {
    this.changePasswordForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }
}
