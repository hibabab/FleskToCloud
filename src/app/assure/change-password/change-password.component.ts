import { Component, EventEmitter, Output } from '@angular/core';
import { UserService } from '../services/user-service.service';



@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
    @Output() close = new EventEmitter<void>();
  
    // Propriétés liées aux champs du formulaire
    oldPassword: string = '';
    newPassword: string = '';
    confirmPassword: string = '';
    errorMessage: string = ''; // Variable pour afficher les erreurs
  
    constructor(private userService: UserService) {}
    onClose() {
      this.close.emit();
    }
  
    // Méthode pour soumettre le formulaire
    submit(): void {
      this.errorMessage = '';  // Réinitialise le message d'erreur
  
      // Validation des mots de passe
      if (this.newPassword !== this.confirmPassword) {
        console.log('Les mots de passe ne correspondent pas');
        return;
      }
  
      if (this.newPassword.length < 6) {
        console.log('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
  
  // Appel au service pour changer le mot de passe
  const data = { oldPassword: this.oldPassword, newPassword: this.newPassword };
  this.userService.changePassword(data).subscribe(() => {
    // Affiche un message de succès dans la console
    console.log('Mot de passe changé avec succès');
    // Ferme le modal après succès
    this.onClose()
  });
  
  
      
       
      
    }

}
