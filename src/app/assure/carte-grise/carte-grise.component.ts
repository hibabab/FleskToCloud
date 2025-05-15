import { Component } from '@angular/core';
import { DocService } from '../services/doc-service.service';


@Component({
  selector: 'app-carte-grise',
  standalone: false,
  templateUrl: './carte-grise.component.html',
  styleUrls: ['./carte-grise.component.css']
})
export class CarteGriseComponent {
  selectedFile: File | null = null;
  isLoading = false;
  errorMessage = '';
  results: any;
  showResult = false;

  private readonly fixedConfig = {
    country: 'tunisia',
    docType: 'Carte grise',
    detectFields: false
  };

  constructor(private docService: DocService) {}

  // Gestion de la sélection de fichier classique
  onFileSelect(event: any): void {
    this.selectedFile = event.target.files[0];
    this.resetState();
  }

  // Gestion du drag & drop
  handleFileDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;

    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.resetState();
    }
  }

  async processDocument(): Promise<void> {
    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.results = await this.docService.processDocument(
        formData,
        this.fixedConfig.country,
        this.fixedConfig.docType,
        this.fixedConfig.detectFields
      ).toPromise();

      this.showResult = true;

    } catch (error) {
      this.errorMessage = 'Erreur lors de l\'analyse du document';
      console.error('Erreur détaillée:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private resetState(): void {
    this.errorMessage = '';
    this.results = null;
    this.showResult = false;
  }
}
