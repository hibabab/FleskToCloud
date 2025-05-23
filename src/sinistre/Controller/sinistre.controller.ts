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
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { ConstatDto } from '../dto/constat-dto.dto';
import { ConstatService } from '../services/constaat.service';
import { S3Service } from '../services/s3/s3.service';

@Controller('constat')
export class ConstatController {
  constructor(
    private readonly constatService: ConstatService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('create-constat/:immatriculation')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photos', maxCount: 10 },
      { name: 'file', maxCount: 1 },
    ]),
  )
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
      const constatDto: ConstatDto = this.parseConstatDto(body.constatDto);
      const photoUrls = await this.handlePhotoUploads(files.photos);
      const pdfUrl = await this.handlePdfUpload(files.file);

      return await this.constatService.createConstat(
        {
          ...constatDto,
          photos: photoUrls,
          pathurl: pdfUrl ?? undefined,
        },
        immatriculation,
        body.conducteur1Email,
        body.conducteur2Email,
      );
    } catch (error) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error.message || 'Échec de la création du constat',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private parseConstatDto(constatDtoJson: string): ConstatDto {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(constatDtoJson, (key, value) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
      key === 'dateAccident' ? new Date(value) : value,
    );
  }

  private async handlePhotoUploads(
    photos?: Express.Multer.File[],
  ): Promise<string[]> {
    if (!photos || photos.length === 0) return [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      photos.map((photo) => this.s3Service.uploadFile(photo, 'photos')),
    );
  }

  private async handlePdfUpload(
    files?: Express.Multer.File[],
  ): Promise<string | null> {
    if (!files || files.length === 0) return null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.s3Service.uploadFile(files[0], 'pdf');
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

  @Get('/:Id')
  async getConstatById(@Param('Id') Id: number) {
    try {
      return await this.constatService.getConstatAvecRelations(Id);
    } catch (error) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        error.message || 'Failed to fetch constats for this vehicle',
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
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
      // Upload vers S3 dans le dossier "rapports"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const rapportUrl = await this.s3Service.uploadFile(
        rapportFile,
        'rapports',
      );

      return await this.constatService.estimerConstatParExpert(
        body.constatId,
        body.montant,
        body.degats,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

  /* Private helper methods */
}
