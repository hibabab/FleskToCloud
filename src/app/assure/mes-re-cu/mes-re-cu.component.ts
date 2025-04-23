import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { finalize } from 'rxjs/operators';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


interface UserDto {
  Cin: string;
  // autres propriétés utilisateur...
}

interface Payment {
  id: number;
  paymentId: string;
  trackingId: string;
  status: string;
  amount: number;
  paymentDate?: Date;
  contrat: {
    num: number;
    // autres propriétés du contrat...
  };
}

interface PaymentResponse {
  success: boolean;
  data: {
    hasPayment: boolean;
    status?: string;
    paymentId?: string;
    trackingId?: string;
    amount?: number;
    paymentDate?: Date;
  };
  message?: string;
}

@Component({
  selector: 'app-mes-re-cu',
  standalone:false,
  templateUrl: './mes-re-cu.component.html',
  styleUrls: ['./mes-re-cu.component.css']
})
export class MesReCuComponent  implements OnInit {
  user: UserDto | null = null;
  userCin: string | null = null;
  num: number | null = null;
  contrats: any[] = [];
  payments: Payment[] = [];
  selectedContrat: any = null;
  showContratsList = false;
  isLoading = false;
  hasSearched = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

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
  toggleContratsList(): void {
    this.showContratsList = !this.showContratsList;
  }

  selectContrat(contrat: any): void {
    this.selectedContrat = contrat;
    this.num = contrat.contrat.num;
    this.showContratsList = false;
  }

  verifyContrat(): void {
    if (this.num) {
      const foundContrat = this.contrats.find(c => c.contrat.num === this.num);
      this.selectedContrat = foundContrat || null;
    } else {
      this.selectedContrat = null;
    }
  }

  onSubmit(): void {
    if (!this.num) return;

    this.isLoading = true;
    this.hasSearched = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.http.get<PaymentResponse>(
      `http://localhost:3000/payments/status/${this.num}`
    ).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          if (response.data.hasPayment && response.data.paymentId) {
            this.payments = [{
              id: Number(response.data.paymentId), // Conversion en number si nécessaire
              paymentId: response.data.paymentId,
              trackingId: response.data.trackingId || '',
              status: response.data.status || 'unknown',
              amount: response.data.amount || 0,
              paymentDate: response.data.paymentDate,
              contrat: {
                num: this.num || 0 // Gestion du cas null avec une valeur par défaut
              }
            }];
          } else {
            this.payments = [];
            this.successMessage = 'Aucun paiement trouvé pour ce contrat';
          }
        } else {
          this.errorMessage = response.message || 'Erreur lors de la récupération du statut de paiement';
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la récupération du statut de paiement';
        console.error('Erreur:', err);
      }
    });
  }


  async generatePaymentReceipt(paymentData: any): Promise<void> {
    try {
      const doc = new jsPDF('p', 'mm', 'a4') as any;
      doc.setFont('helvetica');

      // Variables de position
      let yOffset = 20;
      const margin = 15;
      const lineHeight = 7;
      const sectionSpacing = 5;

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
      doc.text('REÇU DE PAIEMENT', 105, yOffset + 15, { align: 'center' });
      yOffset += 30;

      // 2. Informations du paiement
      doc.setFontSize(10);
      doc.text('INFORMATIONS DE PAIEMENT', margin, yOffset);
      yOffset += lineHeight;

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['Référence Paiement', 'Statut', 'Date Paiement', 'Montant'],
          [
            paymentData.paymentId || 'N/A',
            paymentData.status || 'N/A',
            paymentData.paymentDate ? new Date(paymentData.paymentDate).toLocaleDateString() : 'N/A',
            paymentData.amount ? `${paymentData.amount.toFixed(3)} DT` : '0.000 DT'
          ]
        ],
        styles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { fontStyle: 'bold' },
          2: { fontStyle: 'bold' },
          3: { fontStyle: 'bold' }
        }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 3. Informations du contrat associé
      doc.setFontSize(10);
      doc.text('INFORMATIONS DU CONTRAT', margin, yOffset);
      yOffset += lineHeight;

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['N° Contrat', 'Date Effet', 'Date Expiration'],
          [
            paymentData.contrat?.num || 'N/A',
            this.selectedContrat?.contrat?.dateSouscription ? new Date(this.selectedContrat.contrat.dateSouscription).toLocaleDateString() : 'N/A',
            this.selectedContrat?.contrat?.dateExpiration ? new Date(this.selectedContrat.contrat.dateExpiration).toLocaleDateString() : 'N/A',
            
          ]
        ],
        styles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { fontStyle: 'bold' },
          2: { fontStyle: 'bold' },
          3: { fontStyle: 'bold' }
        }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 4. Détails du véhicule
      doc.setFontSize(10);
      doc.text('INFORMATIONS DU VÉHICULE', margin, yOffset);
      yOffset += lineHeight;

      const vehicule = this.selectedContrat?.vehicule || {};
      autoTable(doc, {
        startY: yOffset,
        body: [
          ['Immatriculation', 'Marque', 'Modèle'],
          [
            vehicule.Imat || 'N/A',
            vehicule.marque || 'N/A',
            vehicule.model || 'N/A',

          ]
        ],
        styles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { fontStyle: 'bold' },
          2: { fontStyle: 'bold' },
          3: { fontStyle: 'bold' }
        }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;
      // Pied de page
      doc.setFontSize(6);
      doc.setTextColor(100);
      doc.text('Flesk Cover - Tél: 24051646 - Email: contact@fleskcover.com', 105, 285, { align: 'center' });

      // Génération du fichier
      const fileName = `Reçu_Paiement_${paymentData.paymentId || new Date().getTime()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur génération reçu PDF:', error);
      throw error;
    }
  }
  downloadReceipt(payment: Payment): void {
    this.isLoading = true;

    // Utilisez les données déjà disponibles plutôt que d'appeler le backend
    this.generatePaymentReceipt({
      paymentId: payment.paymentId,
      status: payment.status,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      contrat: payment.contrat
    }).finally(() => {
      this.isLoading = false;
    });
  }
  // Gardez la méthode loadImageAsBase64 existante
  private loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = () => {
        if (xhr.status === 200) {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
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

  getStatusClass(status: string): string {
    if (!status) return 'bg-gray-100 text-gray-800';

    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'no_payment':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
