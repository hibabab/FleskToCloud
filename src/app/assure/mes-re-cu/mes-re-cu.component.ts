import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { finalize } from 'rxjs/operators';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface UserDto {
  Cin: string;
  nom?: string;
  prenom?: string;
  // autres propriétés utilisateur...
}

interface Payment {
  id: number;
  paymentId: string;
  trackingId: string;
  status: string;
  amount: number;
  paymentDate?:Date;
  contrat: {
    num: number;
  };
}

interface ContratVie {
  contratVie: {
    numero: number;
    dateSouscription?: Date;
    dateExpiration?: Date;
    montant?: number;
    statut?: string;
  };
  user?: {
    nom?: string;
    prenom?: string;
    cin?: string;
  };
  details?: any;
}

interface PaymentResponse {
  success: boolean;
  data: {
    hasPayment: boolean;
    status?: string;
    paymentId?: string;
    trackingId?: string;
    amount?: number;
    paymentDate?: string;
    contratNum?: number;
    payments?: Array<{
      paymentId: string;
      trackingId?: string;
      status?: string;
      amount?: number;
      paymentDate?: string;
    }>;
    totalPayments?: number;
    lastPaymentStatus?: string;
  };
  message?: string;
}

@Component({
  selector: 'app-mes-re-cu',
  standalone: false,
  templateUrl: './mes-re-cu.component.html',
  styleUrls: ['./mes-re-cu.component.css']
})
export class MesReCuComponent implements OnInit {
  user: UserDto | null = null;
  userCin: string | null = null;
  num: number | null = null;
  contrats: any[] = [];
  contratsVie: any[] = [];
  payments: Payment[] = [];
  selectedContrat: any = null;
  selectedContratVie: ContratVie | null = null;
  showContratsList = false;
  isLoading = false;
  hasSearched = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Nouveaux champs pour gérer le choix du type de contrat
  typeContrat: string = 'auto'; // Par défaut, on affiche les contrats auto
  showContratsVieList = false;

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
        // Chargement des contrats selon le type sélectionné
        this.loadContratsBasedOnType();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la récupération des données utilisateur';
        console.error('Erreur:', err);
      }
    });
  }

  // Méthode pour charger les contrats selon le type sélectionné
  loadContratsBasedOnType(): void {
    if (this.typeContrat === 'auto') {
      this.loadUserContrats();
    } else {
      this.loadUserContratsVie();
    }
  }

  // Gestion du changement de type de contrat
  changeTypeContrat(type: string): void {
    this.typeContrat = type;
    this.selectedContrat = null;
    this.selectedContratVie = null;
    this.num = null;
    this.payments = [];
    this.hasSearched = false;
    this.showContratsList = false;
    this.showContratsVieList = false;
    this.successMessage = null;
    this.errorMessage = null;

    // Charger les contrats correspondants au type sélectionné
    this.loadContratsBasedOnType();
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
              this.errorMessage = 'Aucun contrat auto trouvé pour ce CIN';
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

  loadUserContratsVie(): void {
    if (!this.userCin) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.contratsVie = [];

    const Cin = this.userCin;
    this.http.get<any[]>(`http://localhost:3000/contratvie/par-cin/${Cin}`).subscribe({
      next: (contratsVieResponse) => {
        this.isLoading = false;
        if (Array.isArray(contratsVieResponse) && contratsVieResponse.length > 0) {
          this.contratsVie = contratsVieResponse;
        } else {
          this.errorMessage = 'Aucun contrat vie trouvé pour ce CIN';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la récupération des contrats vie';
        console.error('Erreur:', err);
      }
    });
  }

  toggleContratsList(): void {
    if (this.typeContrat === 'auto') {
      this.showContratsList = !this.showContratsList;
      this.showContratsVieList = false;
    } else {
      this.showContratsVieList = !this.showContratsVieList;
      this.showContratsList = false;
    }
  }

  selectContrat(contrat: any): void {
    if (this.typeContrat === 'auto') {
      this.selectedContrat = contrat;
      this.selectedContratVie = null;
      this.num = contrat.contrat.num;
    } else {
      this.selectedContratVie = contrat;
      this.selectedContrat = null;
      this.num = contrat.contratVie.numero;
    }
    this.showContratsList = false;
    this.showContratsVieList = false;
  }

  verifyContrat(): void {
    if (!this.num) return;

    if (this.typeContrat === 'auto') {
      const foundContrat = this.contrats.find(c => c.contrat.num === this.num);
      this.selectedContrat = foundContrat || null;
      this.selectedContratVie = null;
    } else {
      const foundContratVie = this.contratsVie.find(c => c.contratVie.numero === this.num);
      this.selectedContratVie = foundContratVie || null;
      this.selectedContrat = null;
    }
  }

  onSubmit(): void {
    if (!this.num) return;

    this.isLoading = true;
    this.hasSearched = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.typeContrat === 'auto') {
      this.fetchAutoPayment();
    } else {
      this.fetchViePayment();
    }
  }

  fetchAutoPayment(): void {
    this.isLoading = true;
    this.http.get<PaymentResponse>(
      `http://localhost:3000/payments/status/${this.num}`
    ).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          if (response.data.hasPayment && response.data.payments && response.data.payments.length > 0) {
            // Traitement de plusieurs paiements
            this.payments = response.data.payments.map(payment => ({
              id: Number(payment.paymentId),
              paymentId: payment.paymentId,
              trackingId: payment.trackingId || '',
              status: payment.status || 'unknown',
              amount: payment.amount || 0,
              paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : undefined,
              contrat: {
                num: this.num || 0
              }
            }));
          } else {
            // Aucun paiement trouvé
            this.payments = [];
            this.successMessage = 'Aucun paiement trouvé pour ce contrat auto';
          }
        } else {
          this.errorMessage = response.message || 'Erreur lors de la récupération du statut de paiement';
        }
        this.hasSearched = true;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la récupération du statut de paiement';
        console.error('Erreur:', err);
        this.hasSearched = true;
      }
    });
  }

  fetchViePayment(): void {
    this.http.get<PaymentResponse>(
      `http://localhost:3000/payments/vie/status/${this.num}`
    ).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          if (response.data.hasPayment && response.data.paymentId) {
            this.payments = [{
              id: Number(response.data.paymentId),
              paymentId: response.data.paymentId,
              trackingId: response.data.trackingId || '',
              status: response.data.status || 'unknown',
              amount: response.data.amount || 0,
              paymentDate: response.data.paymentDate ? new Date(response.data.paymentDate) : undefined,
              contrat: {
                num: this.num || 0
              }
            }];
          } else {
            this.payments = [];
            this.successMessage = 'Aucun paiement trouvé pour ce contrat vie';
          }
        } else {
          this.errorMessage = response.message || 'Erreur lors de la récupération du statut de paiement vie';
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la récupération du statut de paiement vie';
        console.error('Erreur:', err);
      }
    });
  }

  downloadReceipt(payment: Payment): void {
    this.isLoading = true;

    if (this.typeContrat === 'auto') {
      this.generatePaymentReceiptAuto({
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        contrat: payment.contrat
      }).finally(() => {
        this.isLoading = false;
      });
    } else {
      this.generatePaymentReceiptVie({
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        contrat: payment.contrat
      }).finally(() => {
        this.isLoading = false;
      });
    }
  }

  async generatePaymentReceiptAuto(paymentData: any): Promise<void> {
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
      doc.text('REÇU DE PAIEMENT - CONTRAT AUTO', 105, yOffset + 15, { align: 'center' });
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
      const fileName = `Reçu_Paiement_Auto_${paymentData.paymentId || new Date().getTime()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur génération reçu PDF:', error);
      throw error;
    }
  }

  async generatePaymentReceiptVie(paymentData: any): Promise<void> {
    try {
      const doc = new jsPDF('p', 'mm', 'a4') as any;
      doc.setFont('helvetica');

      // Variables de position
      let yOffset = 15;
      const margin = 15;
      const lineHeight = 6;
      const sectionSpacing = 8;
      const tealColor = [0, 105, 92];

      // 1. En-tête avec logo
      try {
        const logoBase64 = await this.loadImageAsBase64('assets/images/logoFC.png');
        doc.addImage(logoBase64, 'PNG', margin, yOffset, 25, 25);
      } catch (error) {
        console.warn('Logo non chargé');
      }

      // Titre principal
      doc.setFontSize(14);
      doc.setTextColor(...tealColor);
      doc.text('REÇU DE PAIEMENT - CONTRAT VIE', 105, yOffset + 15, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Reçu valide comme justificatif de paiement', 105, yOffset + 22, { align: 'center' });
      yOffset += 30;

      // 2. Informations du paiement
      doc.setFontSize(11);
      doc.setTextColor(...tealColor);
      doc.text('INFORMATIONS DE PAIEMENT', margin, yOffset);
      yOffset += lineHeight + 3;

      autoTable(doc, {
        startY: yOffset,
        head: [['Détail', '']],
        body: [
          ['Référence Paiement', paymentData.paymentId || 'N/A'],
          ['Statut', paymentData.status || 'N/A'],
          ['Date Paiement', paymentData.paymentDate ? new Date(paymentData.paymentDate).toLocaleDateString() : new Date().toLocaleDateString()],
          ['Montant', `${paymentData.amount || '0.00'} DT`],
          ['N° Contrat', this.selectedContratVie?.contratVie?.numero || 'N/A'],
          ['Nom Assuré', `${this.selectedContratVie?.user?.prenom || ''} ${this.selectedContratVie?.user?.nom || ''}`]
        ],
        styles: {
          fontSize: 9,
          cellPadding: 4,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [0, 128, 128],
          textColor: 255,
          fontSize: 10
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 'auto' }
        },
        margin: { left: margin, right: margin }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 3. Signature
      doc.setFontSize(9);
      doc.text('Signature', 160, yOffset + 15);
      doc.line(160, yOffset + 17, 190, yOffset + 17);

      // Pied de page professionnel
      doc.setFontSize(8);
      doc.setTextColor(100);
      const footerY = 280;
      doc.line(margin, footerY, 200 - margin, footerY);
      doc.text('FLESK COVER - Votre partenaire assurance', margin, footerY + 5);
      doc.text('Email: contact@fleskcover.com | Tél: 24051646', margin, footerY + 10);
      doc.text('Adresse: Rue de l\'assurance, Tunis', margin, footerY + 15);
      doc.text(`Document généré le ${new Date().toLocaleDateString()}`, 200 - margin, footerY + 15, { align: 'right' });

      // Génération du fichier
      const fileName = `Reçu_Paiement_Vie_${paymentData.paymentId || new Date().getTime()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur génération reçu PDF vie:', error);
      throw error;
    }
  }

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
