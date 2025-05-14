import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ConstatDto } from '../dto/constat-dto.dto';

import { join } from 'path';
import { promises as fs } from 'fs';
import { ConstatService } from '../services/constaat.service';

@Controller('constat')
export class ConstatController {
  constructor(private readonly constatService: ConstatService) {}

  @Post('create-constat/:immatriculation')
  @UseInterceptors(FilesInterceptor('photos')) // ✅ Gère plusieurs fichiers
  async addConstat(
    @UploadedFiles() photos: Express.Multer.File[],
    @Body()
    body: {
      constatDto: string; // Reçoit le DTO en string JSON
      conducteur1Email: string;
      conducteur2Email?: string;
    },
    @Param('immatriculation') immatriculation: string,
  ) {
    try {
      // Parse le JSON et convertit les dates
      const constatDto: ConstatDto = JSON.parse(
        body.constatDto,
        (key, value) => {
          if (key === 'dateAccident') return new Date(value);
          return value;
      });
  
      // Sauvegarde les photos et récupère les URLs
      const photoUrls = await this.processUploadedPhotos(photos);
  
      // Crée le constat avec les URLs des photos
      return await this.constatService.createConstat(
        { ...constatDto, photos: photoUrls },
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
  
  private async processUploadedPhotos(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPath = join(__dirname, '../../../upload/constat/photos');
    await fs.mkdir(uploadPath, { recursive: true });
  
    return Promise.all(
      files.map(async (file) => {
        const safeName = file.originalname
          .replace(/[^\w.-]/g, '-')
          .replace(/\s+/g, '-');
        const fileName = `${Date.now()}-${safeName}`;
        const filePath = join(uploadPath, fileName);
        await fs.writeFile(filePath, file.buffer);
        return `/upload/constat/photos/${fileName}`;
      }),
    );
  }

  @Get('get_constat_by_user/:userId')
  async getConstatByUser(@Param('userId') userId: number) {
    try {
      return await this.constatService.getConstatsByUserId(userId);
    } catch (error) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error.message || 'Failed to fetch all constats',
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
      const uploadPath = join(__dirname, '../../../upload/constat');
      await fs.mkdir(uploadPath, { recursive: true });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const safeName = file.originalname
        .replace(/[^\w.-]/g, '-')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .replace(/\s+/g, '-');
      const fileName = `${Date.now()}-${safeName}`;
      const filePath = join(uploadPath, fileName);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      await fs.writeFile(filePath, file.buffer);

      const pathUrl = `/upload/constat/${fileName}`;
      return await this.constatService.updateConstatPath(constatId, pathUrl);
    } catch (error) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
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
      const uploadPath = join(__dirname, '../../../upload/rapports');
      await fs.mkdir(uploadPath, { recursive: true });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const safeName = rapportFile.originalname
        .replace(/[^\w.-]/g, '-')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .replace(/\s+/g, '-');
      const fileName = `${Date.now()}-${safeName}`;
      const filePath = join(uploadPath, fileName);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      await fs.writeFile(filePath, rapportFile.buffer);
      const rapportUrl = `/upload/rapports/${fileName}`;

      return await this.constatService.estimerConstatParExpert(
        body.constatId,
        body.montant,
        body.degats,
        rapportUrl,
        body.commentaire,
      );
    } catch (error) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error.message || "Échec de l'estimation",
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  
  @Get('/vehicule/:imat')
  async getByVehicule(@Param('imat') imat: string) {
    return this.constatService.getConstatsByImatriculation(imat);
  }
}
