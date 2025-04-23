import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { finalize } from 'rxjs/operators';
import { PaymentResponse, PaymentService } from '../services/payment.service';


interface UserDto {
  id: number;
  nom: string;
  prenom: string;
  Cin: string;
  telephone: string;
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
@Component({
  selector: 'app-casemstriel',
  standalone: false,
  templateUrl: './casemstriel.component.html',
  styleUrl: './casemstriel.component.css'
})
export class CASemstrielComponent  implements OnInit {
  user: UserDto | null = null;
  userCin: string | null = null;
  contrats: any[] = [];
  num: number | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  contratNum: number | null = null;
  isSemestriel: boolean = false;
  showContratsList: boolean = false;
  selectedContrat: any = null;

  constructor(private http: HttpClient, private router: Router) {}

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
        this.user = user;
        this.userCin = user.Cin;
        this.loadUserContrats();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la récupération des données utilisateur';
        console.error('Erreur:', err);
      }
    });
  }
  loadUserContrats(): void {
    if (!this.userCin) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.contrats = [];

     this.http.get<any>(
    `http://localhost:3000/contrat-auto-geteway/contrats/assure/${this.userCin}`)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response?.success) {
            this.contrats = Array.isArray(response.data)
            ? response.data.map((item: any) => ({
                contrat: {
                  num: item.num,
                  dateSouscription: item.dateSouscription,
                  dateExpiration: item.dateExpiration
                },
                vehicule: item.vehicule || {},
                assure: item.assure || {},
                garanties: item.garanties || []
              }))
            : [];

            if (this.contrats.length === 0) {
              this.errorMessage = 'Aucun contrat trouvé pour ce CIN';
            }
          } else {
            this.errorMessage = response?.message || 'Réponse inattendue du serveur';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Erreur lors de la recherche';
          console.error('Erreur:', err);
        }
      });
  }

  verifyContrat(): void {
    if (!this.num) {
      this.errorMessage = 'Veuillez entrer un numéro de contrat';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedContrat = null;

    // Récupérer les détails complets du contrat
    this.http.get<any>(
      `http://localhost:3000/contrat-auto-geteway/contrat/${this.num}`
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response?.success) {
          this.selectedContrat = response.data;

          // Vérifier si le contrat appartient à l'utilisateur
          if (this.selectedContrat.assure.user.Cin !== this.userCin) {
            this.errorMessage = 'Ce contrat ne vous appartient pas';
            return;
          }

          const contrat = this.selectedContrat.contrat;


          // Vérification du type semestriel
          this.isSemestriel = contrat.cotisationTotale > contrat.montantEcheance;

          if (!this.isSemestriel) {
            this.errorMessage = 'Ce contrat n\'est pas de type semestriel.';
          } else {

           const today = new Date();
           const echeanceDate = new Date(contrat.prochaineEcheance);

           if (today < echeanceDate) {
              this.errorMessage = `La prochaine échéance de paiement est prévue pour le ${echeanceDate.toLocaleDateString()}.`;
          } else {
            this.successMessage = 'Contrat valide pour paiement semestriel.';
          }
          }
        } else {
          this.errorMessage = response?.message || 'Contrat non trouvé';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la récupération du contrat';
        console.error('Erreur:', err);
      }
    });
  }

  onSubmit() {
    if (!this.num || !this.isSemestriel || !this.selectedContrat) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.patch<any>(
      `http://localhost:3000/contrat-auto-geteway/update-echeances/${this.num}`,
      {}
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Paiement enregistré avec succès';
          this.generateContratPDF(response.data);
          this.continuePayment();
        } else {
          this.errorMessage = response.message || 'Erreur lors du traitement';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur serveur';
      }
    });
  }

  toggleContratsList(): void {
    this.showContratsList = !this.showContratsList;
  }

  selectContrat(contrat: any): void {
    this.num = contrat.contrat.num;
    this.showContratsList = false;
    this.verifyContrat();
}
  continuePayment(): void {
    if (this.num) {
      this.router.navigate([`/dashboard-assure/contrat/${this.num}/payment`]);
    } else {
      this.errorMessage = 'Impossible de continuer vers le paiement: données manquantes';
    }
  }

  loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function() {
            if (this.status === 200) {
                const reader = new FileReader();
                reader.onloadend = function() {
                    resolve(reader.result as string);
                };
                reader.onerror = reject;
                reader.readAsDataURL(xhr.response);
            } else {
                reject(new Error('Failed to load image'));
            }
        };
        xhr.onerror = reject;
        xhr.send();
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  async generateContratPDF(contratData: any): Promise<void> {
    try {
      const doc = new jsPDF('p', 'mm', 'a4') as any;
      doc.setFont('helvetica');

      // Variables de position
      let yOffset = 20;
      const margin = 15;
      const lineHeight = 7;
      const sectionSpacing = 5; // Réduit l'espacement entre sections

      // 1. En-tête avec logo
      try {
        const logoBase64 = await this.loadImageAsBase64('assets/images/logoFC.png');
        doc.addImage(logoBase64, 'PNG', margin, yOffset, 30, 30);
      } catch (error) {
        console.warn('Logo non chargé');
      }

      // Titre principal
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('CONTRAT D\'ASSURANCE AUTOMOBILE', 105, yOffset + 15, { align: 'center' });
      yOffset += 30; // Réduit l'espace après le titre

      // 2. Informations du contrat
      doc.setFontSize(12); // Taille de police réduite
      doc.text('INFORMATIONS DU CONTRAT', margin, yOffset);
      yOffset += lineHeight;

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['N° Contrat','Code agence',  'N° Sociétaire','Date Souscription','Date Effet', 'Date Expiration', 'Nature', 'Échéances'],
          [
            contratData.contrat.id || 'N/A',
            133,
            contratData.assure?.numSouscription || 'N/A',
            contratData.contrat.dateSouscription || 'N/A',
            contratData.contrat.dateSouscription || 'N/A',
            contratData.contrat.dateExpiration || 'N/A',
            contratData.contrat.NatureContrat || 'N/A',
            contratData.contrat.echeances || 'N/A'
          ]
        ],
        styles: {
          fontSize: 8, // Taille de police réduite pour le tableau
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { fontStyle: 'bold' },
          2: { fontStyle: 'bold' },
          3: { fontStyle: 'bold' },
          4: { fontStyle: 'bold' },
          5: { fontStyle: 'bold' },
          6: { fontStyle: 'bold' },
          7: { fontStyle: 'bold' }
        }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 3. Informations du sociétaire avec adresse
      doc.setFontSize(12);
      doc.text('INFORMATIONS SOCIÉTAIRE', margin, yOffset);
      yOffset += lineHeight;

      const assure = contratData.assure || {};
      const adresse = assure.adresse || {};

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['Nom', 'Prénom', 'CIN', 'Téléphone', 'Bonus/Malus'],
          [
            assure.nom || 'N/A',
            assure.prenom || 'N/A',
            assure.Cin || 'N/A',
            assure.telephone || 'N/A',
            assure.bonusMalus || 'N/A'
          ],
          ['Adresse', 'Ville', 'Code Postal', 'Pays', ''],
          [
            adresse.rue || 'N/A',
            adresse.ville || 'N/A',
            adresse.codePostal || 'N/A',
            adresse.pays || 'N/A',
            ''
          ]
        ],
        styles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { fontStyle: 'bold' },
          2: { fontStyle: 'bold' },
          3: { fontStyle: 'bold' },
          4: { fontStyle: 'bold' }
        }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 4. Caractéristiques du véhicule
      doc.setFontSize(12);
      doc.text('CARACTÉRISTIQUES DU VÉHICULE', margin, yOffset);
      yOffset += lineHeight;

      const vehicule = contratData.vehicule || {};
      autoTable(doc, {
        startY: yOffset,
        body: [
          ['Immatriculation', 'Marque', 'Modèle', 'Type', 'Puissance', 'Valeur neuve'],
          [
            vehicule.Imat || 'N/A',
            vehicule.marque || 'N/A',
            vehicule.model || 'N/A',
            vehicule.type || 'N/A',
            vehicule.puissance ? `${vehicule.puissance} CV` : 'N/A',
            vehicule.valeurNeuf ? `${vehicule.valeurNeuf} DT` : 'N/A'
          ],
          ['Énergie', 'Nb places', 'Cylindrée', 'Poids vide', 'Charge utile', 'N° chassis'],
          [
            vehicule.energie || 'N/A',
            vehicule.nbPlace || 'N/A',
            vehicule.cylindree || 'N/A',
            vehicule.poidsVide || 'N/A',
            vehicule.chargeUtil || 'N/A',
            vehicule.numChassis || 'N/A'
          ]
        ],
        styles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { fontStyle: 'bold' },
          2: { fontStyle: 'bold' },
          3: { fontStyle: 'bold' },
          4: { fontStyle: 'bold' },
          5: { fontStyle: 'bold' }
        }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 5. Garanties (tableau visible)
      doc.setFontSize(12);
      doc.text('GARANTIES SOUSCRITES', margin, yOffset);
      yOffset += lineHeight;

      const garanties = contratData.garanties || [];
      autoTable(doc, {
        startY: yOffset,
        head: [['Garantie', 'Capital', 'Cotisation']],
        body: garanties.map((g: any) => [
          g.type || 'N/A',
          g.capital ? `${g.capital} DT` : '-',
          g.cotisationNette ? `${g.cotisationNette.toFixed(3)} DT` : '0.000 DT'
        ]),
        styles: {
          fontSize: 7, // Taille de police plus petite pour le tableau des garanties
        },
        headStyles: {
          fillColor: [0,30, 0],
          textColor: 255,
          fontSize: 8
        },
        margin: { left: margin }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 6. Détails financiers
      doc.setFontSize(12);
      doc.text('DÉTAILS FINANCIERS', margin, yOffset);
      yOffset += lineHeight;

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['Cotisation Nette', 'Cotisation Totale', 'Montant Échéance'],
          [
            contratData.contrat.cotisationNette ? `${contratData.contrat.cotisationNette.toFixed(3)} DT` : '0.000 DT',
            contratData.contrat.cotisationTotale ? `${contratData.contrat.cotisationTotale.toFixed(3)} DT` : '0.000 DT',
            contratData.contrat.montantEcheance ? `${contratData.contrat.montantEcheance.toFixed(3)} DT` : '0.000 DT'
          ]
        ],
        styles: {
          fontSize: 8,
          halign: 'right'
        },
        columnStyles: {
          0: { fontStyle: 'bold', halign: 'left' },
          1: { fontStyle: 'bold' },
          2: { fontStyle: 'bold' }
        }
      });

      // 7. Signatures - position ajustée
      const signatureY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(10);

      // Signature du sociétaire
      doc.text('Le Sociétaire', margin + 20, signatureY);
      doc.line(margin + 20, signatureY + 2, margin + 70, signatureY + 2);

      // Signature du rédacteur
      const pageWidth = doc.internal.pageSize.width;
      doc.text('Le Rédacteur', pageWidth - margin - 70, signatureY);
      doc.line(pageWidth - margin - 70, signatureY + 2, pageWidth - margin - 20, signatureY + 2);

      // 8. Pied de page
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('Flesk Cover - Tél: 24051646 - Email: contact@fleskcover.com', 105, 285, { align: 'center' });

      // Génération du fichier
      const fileName = `Contrat_Auto_${contratData.contrat.id || new Date().getTime()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur génération PDF:', error);
    }
  }
}
