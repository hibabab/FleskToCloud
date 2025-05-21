import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { ConstatDto } from '../dto/constat-dto.dto';
import { join } from 'path';
import { promises as fs } from 'fs';
import { ConstatService } from '../services/constaat.service';

@Controller('constat')
export class ConstatController {
  constructor(private readonly constatService: ConstatService) {}

  @Post('create-constat/:immatriculation')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'photos', maxCount: 10 },
    { name: 'file', maxCount: 1 },
  ]))
 async addConstat(
  @UploadedFiles()
  files: {
    photos?: Express.Multer.File[];
    file?: Express.Multer.File[];
  },
  @Body()
  body: {
    constatDto: string;
    conducteur1Email: string;
    conducteur2Email?: string;
  },
  @Param('immatriculation') immatriculation: string,
) {
  try {
    // Parse le JSON et convertit les dates
    const constatDto: ConstatDto = this.parseConstatDto(body.constatDto);
    
    // Traiter les fichiers uploadés
    const photoUrls = await this.handlePhotoUploads(files.photos);
    const pdfUrl = await this.handlePdfUpload(files.file);
    
    // Crée le constat avec les URLs des photos et du PDF
    return await this.constatService.createConstat(
      { 
        ...constatDto, 
        photos: photoUrls,
        pathurl: pdfUrl ?? undefined
        
      },
      immatriculation,
      body.conducteur1Email,
      body.conducteur2Email,
    );
  } catch (error) {
    throw new HttpException(
      error.message || 'Échec de la création du constat',
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Parse le JSON du DTO et convertit les dates
 */
private parseConstatDto(constatDtoJson: string): ConstatDto {
  return JSON.parse(
    constatDtoJson,
    (key, value) => key === 'dateAccident' ? new Date(value) : value
  );
}

/**
 * Traite les photos uploadées et retourne leurs URLs
 */
private async handlePhotoUploads(photos?: Express.Multer.File[]): Promise<string[]> {
  if (!photos || photos.length === 0) {
    return [];
  }
  
  return await this.processUploadedPhotos(photos);
}

/**
 * Traite le fichier PDF uploadé et retourne son URL
 */
private async handlePdfUpload(files?: Express.Multer.File[]): Promise<string | null> {
  if (!files || files.length === 0) {
    return null;
  }
  
  return await this.processUploadedPdf(files[0]);
}

  @Get('get_constat_by_user/:userId')
  async getConstatByUser(@Param('userId') userId: number) {
    try {
      return await this.constatService.getConstatsByUserId(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch constats',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  
  @Get('get_all_constats')
  async getAllConstats() {
    try {
      return await this.constatService.getAllConstats();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch all constats',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/:Id')
  async getConstatById(@Param('Id') Id: number) {
    try {
      return await this.constatService.getConstatAvecRelations(Id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch constats',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/vehicule/:imat')
  async getByVehicule(@Param('imat') imat: string) {
    try {
      return await this.constatService.getConstatsByImatriculation(imat);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch constats for this vehicle',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('upload-constat-file/:constatId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadConstatFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('constatId') constatId: number,
  ) {
    try {
      const pathUrl = await this.saveFile(file, '../../../upload/constat');
      return await this.constatService.updateConstatPath(constatId, pathUrl);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to upload file',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('affecter-expert')
  async affecterExpert(
    @Body()
    data: {
      expertId: number;
      constatId: number;
      agentId: number;
      commentaire?: string;
    },
  ) {
    try {
      return await this.constatService.affecterExpertAConstat(
        data.expertId,
        data.constatId,
        data.agentId,
        data.commentaire,
      );
    } catch (error) {
      throw new HttpException(
        error.message || "Échec de l'affectation",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('programmer-expertise')
  async programmerExpertise(
    @Body()
    data: {
      constatId: number;
      date: string;
      heure: string;
      lieu: string;
      commentaire?: string;
    },
  ) {
    try {
      const dateObj = new Date(data.date);
      return await this.constatService.programmerExpertise(
        data.constatId,
        dateObj,
        data.heure,
        data.lieu,
        data.commentaire,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Échec de la programmation',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('estimer-constat-expert')
  @UseInterceptors(FileInterceptor('rapport'))
  async estimerConstatParExpert(
    @Body()
    body: {
      constatId: number;
      montant: number;
      degats: string;
      commentaire?: string;
    },
    @UploadedFile() rapportFile: Express.Multer.File,
  ) {
    try {
      const rapportUrl = await this.saveFile(rapportFile, '../../../upload/rapports');
      return await this.constatService.estimerConstatParExpert(
        body.constatId,
        body.montant,
        body.degats,
        rapportUrl,
        body.commentaire,
      );
    } catch (error) {
      throw new HttpException(
        error.message || "Échec de l'estimation",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('estimer-montant-agent')
  async estimerMontantParAgent(
    @Body()
    body: {
      constatId: number;
      agentId: number;
      montant: number;
      degats?: string;
      commentaire?: string;
    },
  ) {
    try {
      return await this.constatService.estimerMontantParAgent(
        body.constatId,
        body.agentId,
        body.montant,
        body.degats,
        body.commentaire,
      );
    } catch (error) {
      throw new HttpException(
        error.message || "Échec de l'estimation",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /* Private helper methods */

  private async processUploadedPhotos(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPath = join(__dirname, '../../../upload/constat/photos');
    await fs.mkdir(uploadPath, { recursive: true });
    
    return Promise.all(
      files.map(async (file) => {
        const fileName = this.generateSafeFileName(file.originalname);
        const filePath = join(uploadPath, fileName);
        await fs.writeFile(filePath, file.buffer);
        return `/upload/constat/photos/${fileName}`;
      }),
    );
  }

  private async processUploadedPdf(file: Express.Multer.File): Promise<string> {
    const uploadPath = join(__dirname, '../../../upload/constat/pdf');
    await fs.mkdir(uploadPath, { recursive: true });
    
    const fileName = this.generateSafeFileName(file.originalname);
    const filePath = join(uploadPath, fileName);
    await fs.writeFile(filePath, file.buffer);
    
    return `/upload/constat/pdf/${fileName}`;
  }

  private async saveFile(file: Express.Multer.File, relativePath: string): Promise<string> {
    const uploadPath = join(__dirname, relativePath);
    await fs.mkdir(uploadPath, { recursive: true });

    const fileName = this.generateSafeFileName(file.originalname);
    const filePath = join(uploadPath, fileName);
    await fs.writeFile(filePath, file.buffer);

    const pathParts = relativePath.split('/');
    const folderName = pathParts[pathParts.length - 1];
    return `/${folderName}/${fileName}`;
  }

  private generateSafeFileName(originalName: string): string {
    const safeName = originalName
      .replace(/[^\w.-]/g, '-')
      .replace(/\s+/g, '-');
    return `${Date.now()}-${safeName}`;
  }
}