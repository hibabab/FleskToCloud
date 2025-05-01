import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { UserDto } from '../models/user-dto';

@Component({
  selector: 'app-historique-contrat-vie',
  standalone: false,
  templateUrl: './historique-contrat-vie.component.html',
  styleUrl: './historique-contrat-vie.component.css'
})
export class HistoriqueContratVieComponent implements OnInit {
  cin: string = '';
  contrats: any[] = [];
  user: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  hasSearched: boolean = false; // Nouvelle variable pour suivre si la recherche a été faite

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
        this.cin = user.Cin;
        // Après avoir récupéré le CIN, on cherche automatiquement les contrats
        this.searchContrats();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de la récupération des données utilisateur';
        console.error('Erreur:', err);
      }
    });
  }


  searchContrats(): void {
   
    this.isLoading = true;
    this.errorMessage = '';
    this.contrats = [];
    this.user = null;

    // Récupérer les informations de l'utilisateur
    this.http.get<any>(`http://localhost:3000/auth/user/${this.cin}`).subscribe({
      next: (userData) => {
        this.user = userData;
        this.getContratsVie();
      },
      error: (error) => {
        this.handleError('CIN non trouvé ou erreur de vérification', error);
      }
    });
  }

  private getContratsVie(): void {
   const Cin=Number(this.cin);
    this.http.get<any[]>(`http://localhost:3000/contratvie/par-cin/${Cin}`).subscribe({
      next: (contrats) => {
        this.contrats = contrats;
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError('Erreur lors de la récupération des contrats', error);
      }
    });
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    this.isLoading = false;
    console.error(error);
  }

  async downloadContrat(contrat: any): Promise<void> {
    try {
      // Convertir le CIN en nombre
      const cinNumber = parseInt(this.cin, 10);

      // Récupérer les informations de l'assuré
      const userInfo = await this.getUserInfo(cinNumber);

      const { jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF('p', 'mm', 'a4') as any;
      doc.setFont('helvetica');

      // Variables de position
      let yOffset = 10;
      const margin = 10;
      const lineHeight = 5;
      const sectionSpacing = 5;
      const tealColor = [0, 105, 92];

      // 1. En-tête avec logo
      try {
        const logoBase64 = await this.loadImageAsBase64('assets/images/logoFC.png');
        doc.addImage(logoBase64, 'PNG', margin, yOffset, 20, 20);
      } catch (error) {
        console.warn('Logo non chargé');
      }

      // Titre principal
      doc.setFontSize(12);
      doc.setTextColor(...tealColor);
      doc.text('CONTRAT D\'ASSURANCE VIE', 105, yOffset + 12, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Document confidentiel - Ne pas divulguer', 105, yOffset + 18, { align: 'center' });
      yOffset += 25;

      // 2. Informations de l'assuré
      doc.setFontSize(10);
      doc.setTextColor(...tealColor);
      doc.text('INFORMATIONS DE L\'ASSURÉ', margin, yOffset);
      yOffset += lineHeight;

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['Nom', 'Prénom', 'CIN', 'Téléphone', 'Date de naissance', 'Adresse'],
          [
            userInfo.nom || 'N/A',
            userInfo.prenom || 'N/A',
            userInfo.Cin || 'N/A',
            userInfo.telephone || 'N/A',
            userInfo.date_naissance ? new Date(userInfo.date_naissance).toLocaleDateString() : 'N/A',
            `${userInfo.adresse?.rue || ''} ${userInfo.adresse?.numMaison || ''}, ${userInfo.adresse?.codePostal || ''} ${userInfo.adresse?.ville || ''}, ${userInfo.adresse?.pays || ''}`
          ]
        ],
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        headStyles: { fillColor: [0, 128, 128], textColor: 255, fontSize: 9 },
        theme: 'grid',
        margin: { left: margin, right: margin }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 3. Informations du contrat
      doc.setFontSize(10);
      doc.setTextColor(...tealColor);
      doc.text('INFORMATIONS DU CONTRAT', margin, yOffset);
      yOffset += lineHeight;

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['N° Contrat', 'Date d\'effet', 'Cotisation', 'Garanties'],
          [
            contrat.contratVie?.numero || 'N/A',
      contrat.contratVie?.dateEffet || 'N/A',
      `${contrat.contratVie?.cotisation || '0.00'} DT`,
      contrat.contratVie?.garanties || 'N/A'
          ]
        ],
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        headStyles: { fillColor: [0, 128, 128], textColor: 255, fontSize: 9 },
        theme: 'grid',
        margin: { left: margin, right: margin }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 4. Informations spécifiques
      doc.setFontSize(10);
      doc.setTextColor(...tealColor);
      doc.text('INFORMATIONS DE SOUSCRIPTION', margin, yOffset);
      yOffset += lineHeight;

      autoTable(doc, {
        startY: yOffset,
        body: [
          ['N° Souscription', 'Situation Professionnelle', 'Revenu Mensuel'],
          [
            contrat.assureVie?.numSouscription || 'N/A',
            contrat.assureVie?.situationProfessionnelle || 'N/A',
            `${contrat.assureVie?.revenuMensuel || '0.00'} DT`
          ]
        ],
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        headStyles: { fillColor: [0, 128, 128], textColor: 255, fontSize: 9 },
        theme: 'grid',
        margin: { left: margin, right: margin }
      });
      yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;

      // 5. Informations de l'emprunt (si existant)
      if (contrat.emprunt) {
        doc.setFontSize(10);
        doc.setTextColor(...tealColor);
        doc.text('INFORMATIONS DE L\'EMPRUNT', margin, yOffset);
        yOffset += lineHeight;

        autoTable(doc, {
          startY: yOffset,
          body: [
            ['Organisme Prêteur', 'Montant Prêt', 'Taux Intérêt', 'Date Premier Remb.', 'Date Dernier Remb.', 'Type Amortissement', 'Périodicité'],
            [
              contrat.emprunt.organismePreteur || 'N/A',
              `${contrat.emprunt.montantPret || '0.00'} DT`,
              `${(contrat.emprunt.tauxInteret * 100 || 0).toFixed(2)}%`,
              contrat.emprunt.datePremierR || 'N/A',
              contrat.emprunt.dateDernierR || 'N/A',
              contrat.emprunt.typeAmortissement || 'N/A',
              contrat.emprunt.periodiciteAmortissement || 'N/A'
            ]
          ],
          styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
          headStyles: { fillColor: [0, 128, 128], textColor: 255, fontSize: 9 },
          theme: 'grid',
          margin: { left: margin, right: margin }
        });
        yOffset = (doc as any).lastAutoTable.finalY + sectionSpacing;
      }

      // Signatures
      const signatureY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(10);
      doc.text('Le Sociétaire', margin + 20, signatureY);
      doc.line(margin + 20, signatureY + 2, margin + 70, signatureY + 2);

      const pageWidth = doc.internal.pageSize.width;
      doc.text('Le Rédacteur', pageWidth - margin - 70, signatureY);
      doc.line(pageWidth - margin - 70, signatureY + 2, pageWidth - margin - 20, signatureY + 2);

      // Pied de page
      doc.setFontSize(7);
      doc.setTextColor(100);
      const footerY = 285;
      doc.line(margin, footerY, 200 - margin, footerY);
      doc.text('FLESK COVER - Votre partenaire assurance', margin, footerY + 4);
      doc.text('Email: contact@fleskcover.com | Tél: 24051646', margin, footerY + 8);
      doc.text(`Document généré le ${new Date().toLocaleDateString()}`, 200 - margin, footerY + 8, { align: 'right' });

      // Sauvegarde du PDF
      const fileName = `Contrat_Vie_${contrat.numero || new Date().getTime()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Erreur génération contrat PDF:', error);
      this.errorMessage = 'Erreur lors de la génération du PDF';
    }
  }

  private async getUserInfo(cin: number): Promise<any> {
    return this.http.get<any>(`http://localhost:3000/auth/user/${cin}`).toPromise();
  }

  private async loadImageAsBase64(url: string): Promise<string> {
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


}
