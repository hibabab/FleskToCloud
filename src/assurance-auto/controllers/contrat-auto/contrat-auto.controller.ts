import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, HttpStatus, HttpException, ValidationPipe, UsePipes, Logger, BadRequestException, Patch, ParseEnumPipe } from '@nestjs/common';
import { AssureDto } from 'src/assurance-auto/dto/assure.dto';
import { ContratAutoDto } from 'src/assurance-auto/dto/contratauto.dto';
import { CreateVehiculeDto } from 'src/assurance-auto/dto/vehicule.dto';
import { ContratAutoService } from 'src/assurance-auto/services/contrat-auto/contrat-auto.service';

// Interfaces pour les réponses standardisées
interface StandardResponse<T> {
  status: number;
  message: string;
  data: T | null;
}

interface ContratSummaryResponse {
  num: string | number;
  dateSouscription: Date | string | null;
  dateExpiration: Date | string | null;
  vehicule: {
    marque: string;
    model: string;
    Imat: string;
  };
}

interface FullContratResponse {
  contrat: any;
  assure: any;
  vehicule: any;
  garanties: any[];
}

@Controller('contrat-auto-geteway')
export class ContratAutoController {
  private readonly logger = new Logger(ContratAutoController.name);
  
  constructor(private readonly contratAutoService: ContratAutoService) {}

  @Get('CA')
  async getAllCA(): Promise<StandardResponse<FullContratResponse[]>> {
    try {
      const contrats = await this.contratAutoService.getAllContratAuto();
      return {
        status: HttpStatus.OK,
        message: 'Tous les contrats auto récupérés avec succès',
        data: contrats as any,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('createCA')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createContratAuto(
    @Body() data: { assure: AssureDto; Cin: number; vehicule: CreateVehiculeDto; contrat: ContratAutoDto }
  ): Promise<StandardResponse<FullContratResponse>> {
    try {
      const result = await this.contratAutoService.createCA(
        data.assure,
        data.Cin,
        data.vehicule,
        data.contrat
      );
      return {
        status: HttpStatus.CREATED,
        message: 'Contrat auto créé avec succès',
        data: result as any,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('search')
  async getContrat(
    @Query('Cin') Cin: number,
    @Query('Imat') Imat: string
  ): Promise<StandardResponse<FullContratResponse[]>> {
    try {
      if (!Cin || !Imat) {
        throw new BadRequestException('Cin and Imat are required');
      }
      
      const contrats = await this.contratAutoService.getContratByCINAndImmatriculation(Cin, Imat);
      return {
        status: HttpStatus.OK,
        message: 'Contrats récupérés avec succès',
        data: contrats as any,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('renouveler-contrat')
  @UsePipes(new ValidationPipe({ transform: true }))
  async renouvelerContrat(
    @Body() data: { Cin: number; Imat: string; packChoice?: 'same' | 'Pack1' | 'Pack2' | 'Pack3' }
  ): Promise<StandardResponse<FullContratResponse>> {
    try {
      if (!data?.Cin || !data?.Imat) {
        throw new BadRequestException('Cin and Imat are required');
      }
      
      const result = await this.contratAutoService.creerNouveauContrat(
        data.Cin,
        data.Imat,
        data.packChoice || 'same'
      );
      
      if (result.message) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: result.message,
          data: null,
        };
      }
      
      return {
        status: HttpStatus.CREATED,
        message: 'Nouveau contrat créé avec succès',
        data: result.contrat as any,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch('update-echeances/:numContrat')
  async updateEcheances(
    @Param('numContrat', ParseIntPipe) numContrat: number
  ): Promise<StandardResponse<FullContratResponse>> {
    try {
      if (!numContrat || numContrat <= 0) {
        throw new BadRequestException('Invalid contract number');
      }
      
      const result = await this.contratAutoService.updateEcheancesAndGetFullContract(numContrat);
      return {
        status: HttpStatus.OK,
        message: 'Échéances mises à jour avec succès',
        data: result as any,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('contrat/:numContrat')
  async getContratDetailsByNum(
    @Param('numContrat', ParseIntPipe) numContrat: number
  ): Promise<StandardResponse<FullContratResponse>> {
    try {
      if (!numContrat || numContrat <= 0) {
        throw new BadRequestException('Valid contract number is required');
      }

      const contratFromService = await this.contratAutoService.getContratDetailsByNum(numContrat);
      return {
        status: HttpStatus.OK,
        message: 'Détails du contrat récupérés avec succès',
        data: contratFromService as any,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('contrats/assure/:cin')
  async getContratsByUserCin(
    @Param('cin') cin: number
  ): Promise<StandardResponse<ContratSummaryResponse[]>> {
    try {
      if (!cin) {
        throw new BadRequestException('Cin is required');
      }

      const contrats = await this.contratAutoService.getContratsByUserCin(cin);
      return {
        status: HttpStatus.OK,
        message: 'Contrats récupérés avec succès',
        data: contrats as any,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('assures')
  async getAllAssures(): Promise<StandardResponse<any[]>> {
    try {
      const assures = await this.contratAutoService.getAllAssures();
      return {
        status: HttpStatus.OK,
        message: 'Liste des assurés récupérée avec succès',
        data: assures,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('contrat/:numContrat/status')
  async updateContratStatus(
    @Param('numContrat', ParseIntPipe) numContrat: number,
    @Body('status', new ParseEnumPipe(['valide', 'invalide'])) nouveauStatus: 'valide' | 'invalide'
  ): Promise<StandardResponse<FullContratResponse>> {
    try {
      const updatedContrat = await this.contratAutoService.updateContratStatus(numContrat, nouveauStatus);
      return {
        status: HttpStatus.OK,
        message: `Statut du contrat mis à jour avec succès vers '${nouveauStatus}'`,
        data: updatedContrat as any,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}