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
  ): Promise<{ success: boolean, data: FullContratResponse, message: string }> {
    try {
      const result = await this.contratAutoService.createCA(
        data.assure,
        data.Cin,
        data.vehicule,
        data.contrat
      );
      return {
        success: true,
        message: 'Contrat auto créé avec succès',
        data: result as any,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          data: null,
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
): Promise<any> {
  try {
    // Validation des données requises
    if (!data?.Cin || !data?.Imat) {
      return {
        success: false,
        message: 'CIN et immatriculation sont obligatoires',
        data: null
      };
    }

    // Appeler la méthode avec le choix de pack
    const result = await this.contratAutoService.creerNouveauContrat(
      data.Cin,
      data.Imat,
      data.packChoice || 'same'
    );

    if (!result.contrat) {
      return {
        success: false,
        message: result.message || 'Erreur lors du renouvellement du contrat',
        data: null
      };
    }

    // Formatage complet de la réponse pour le PDF
    const response = {
      contrat: {
        id: result.contrat.num || result.contrat.num,
        dateSouscription: this.formatDate(result.contrat.dateSouscription),
        dateExpiration: this.formatDate(result.contrat.dateExpiration),
        dateEffet: this.formatDate(result.contrat.dateEffet),
        packChoisi: result.contrat.packChoisi || 'Non spécifié',
        cotisationNette: result.contrat.cotisationNette || 0,
        cotisationTotale: result.contrat.cotisationTotale || 0,
       
      },
      assure: {
        numSouscription: result.contrat.assure?.NumSouscription || 0,
        bonusMalus: result.contrat.assure?.bonusMalus || 0,
        nom: result.contrat.assure?.user?.nom || 'Non spécifié',
        prenom: result.contrat.assure?.user?.prenom || 'Non spécifié',
        Cin: result.contrat.assure?.user?.Cin || 'Non spécifié',
        telephone: result.contrat.assure?.user?.telephone || 'Non spécifié',
        email: result.contrat.assure?.user?.email || 'Non spécifié',
        dateNaissance: this.formatDate(result.contrat.assure?.user?.date_naissance),
        adresse: result.contrat.assure?.user?.adresse ? {
          gouvernat:result.contrat.assure.user.adresse.gouvernat || 'Non spécifié',
          rue: result.contrat.assure.user.adresse.rue || 'Non spécifié',
          numMaison: result.contrat.assure.user.adresse.numMaison || 'Non spécifié',
          ville: result.contrat.assure.user.adresse.ville || 'Non spécifié',
          codePostal: result.contrat.assure.user.adresse.codePostal || 'Non spécifié',
          pays: result.contrat.assure.user.adresse.pays || 'Non spécifié'
        } : null
      },
      vehicule: {
        type: result.contrat.vehicule?.type || 'Non spécifié',
        marque: result.contrat.vehicule?.marque || 'Non spécifié',
        model: result.contrat.vehicule?.model || 'Non spécifié',
        Imat: result.contrat.vehicule?.Imat || 'Non spécifié',
        energie: result.contrat.vehicule?.energie || 'Non spécifié',
        nbPlace: result.contrat.vehicule?.nbPlace || 0,
        DPMC: this.formatDate(result.contrat.vehicule?.DPMC),
        cylindree: result.contrat.vehicule?.cylindree || 'Non spécifié',
        chargeUtil: result.contrat.vehicule?.chargeUtil || 0,
        valeurNeuf: result.contrat.vehicule?.valeurNeuf || 0,
        numChassis: result.contrat.vehicule?.numChassis || 'Non spécifié',
        poidsVide: result.contrat.vehicule?.poidsVide || 0,
        puissance: result.contrat.vehicule?.puissance || 0,
      },
      garanties: (result.contrat.garanties || []).map(g => ({
        id: g.id,
        type: g.type || 'Non spécifié',
        capital: g.capital || 0,
        cotisationNette: g.cotisationNette || 0,
        franchise: g.franchise || 0,
      }))
    };

    return {
      success: true,
      data: response,
      message: 'Contrat renouvelé avec succès'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur lors du renouvellement',
      data: null
    };
  }
}

private formatDate(date: Date | string | undefined): string {
  if (!date) return 'Non spécifié';
  const d = new Date(date);
  return isNaN(d.getTime()) ? 'Non spécifié' : d.toLocaleDateString('fr-FR');
}
@Patch('update-echeances/:numContrat')
async updateEcheances(
  @Param('numContrat', ParseIntPipe) numContrat: number
): Promise<any> {
  try {
    if (!numContrat || numContrat <= 0) {
      return {
        success: false,
        message: 'Numéro de contrat invalide',
        data: null
      };
    }
    
    const result = await this.contratAutoService.updateEcheancesAndGetFullContract(numContrat);
    
    return {
      success: true,
      message: 'Échéances mises à jour avec succès',
      data: {
        contrat: {
          id: result.num || result.id,  // Garantit l'ID
          num: result.num,  // Ajout du numéro de contrat
          dateSouscription: result.dateSouscription,
          dateExpiration: result.dateExpiration,
          echeances: result.echeances,
          NatureContrat: result.NatureContrat,
          typePaiement: result.typePaiement,
          cotisationNette: result.cotisationNette,
          cotisationTotale: result.cotisationTotale,
          montantEcheance: result.montantEcheance,
          packChoisi: result.packChoisi
        },
        assure: result.assure ? {
          numSouscription: result.assure.NumSouscription || 0,
          bonusMalus: result.assure.bonusMalus || 0,
          nom: result.assure.user?.nom || 'Non spécifié',
          prenom: result.assure.user?.prenom || 'Non spécifié',
          Cin: result.assure.user?.Cin || 'Non spécifié',
          telephone: result.assure.user?.telephone || 'Non spécifié',
          email: result.assure.user?.email || 'Non spécifié',
          dateNaissance: result.assure.user?.date_naissance,
          adresse: result.assure.user?.adresse ? {
            rue: result.assure.user.adresse.rue || 'Non spécifié',
            gouvernat:result.contrat.assure.user.adresse.gouvernat || 'Non spécifié',
            numMaison: result.assure.user.adresse.numMaison || 'Non spécifié',
            ville: result.assure.user.adresse.ville || 'Non spécifié',
            codePostal: result.assure.user.adresse.codePostal || 'Non spécifié',
            pays: result.assure.user.adresse.pays || 'Non spécifié'
          } : null
        } : null,
        vehicule: result.vehicule ? {
          type: result.vehicule.type || 'Non spécifié',
          marque: result.vehicule.marque || 'Non spécifié',
          model: result.vehicule.model || 'Non spécifié',
          Imat: result.vehicule.Imat || 'Non spécifié',
          energie: result.vehicule.energie || 'Non spécifié',
          nbPlace: result.vehicule.nbPlace || 0,
          DPMC: result.vehicule.DPMC,
          cylindree: result.vehicule.cylindree || 'Non spécifié',
          chargeUtil: result.vehicule.chargeUtil || 0,
          valeurNeuf: result.vehicule.valeurNeuf || 0,
          numChassis: result.vehicule.numChassis || 'Non spécifié',
          poidsVide: result.vehicule.poidsVide || 0,
          puissance: result.vehicule.puissance || 0,
        } : null,
        garanties: (result.garanties || []).map(g => ({
          id: g.id,
          type: g.type || 'Non spécifié',
          capital: g.capital || 0,
          cotisationNette: g.cotisationNette || 0,
          franchise: g.franchise || 0,
        }))
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Erreur lors de la mise à jour des échéances',
      data: null
    };
  }
}

  @Get('contrats/assure/:cin')
  async getContratsByUserCin(
    @Param('cin') cin: number
  ): Promise<any> {
    try {
      if (!cin) {
        throw new BadRequestException('Cin is required');
      }
      
      const contrats = await this.contratAutoService.getContratsByUserCin(cin);
      console.log("Contrats retournés:", JSON.stringify(contrats, null, 2));
      return {
        success: true,
        message: 'Contrats récupérés avec succès',
        data: contrats
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Une erreur est survenue lors de la récupération des contrats',
        data: null
      };
    }
  }
  
  @Get('contrat/:numContrat')
  async getContratDetailsByNum(
    @Param('numContrat', ParseIntPipe) numContrat: number
  ): Promise<any> {
    try {
      if (!numContrat || numContrat <= 0) {
        throw new BadRequestException('Valid contract number is required');
      }
      
      const contratFromService = await this.contratAutoService.getContratDetailsByNum(numContrat);
      
      return {
        success: true,
        message: 'Détails du contrat récupérés avec succès',
        data: contratFromService
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Contrat non trouvé ou erreur lors de la récupération',
        data: null
      };
    }
  }

  @Get('assures')
  async getAllAssures(): Promise<any> {
    try {
      const assures = await this.contratAutoService.getAllAssures();
      return {
        success: true,
        message: 'Liste des assurés récupérée avec succès',
        data: assures,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Une erreur est survenue lors de la récupération des assurés',
        data: []
      };
    }
  }
  @Patch('contrat/:numContrat/status')
  async updateContratStatus(
    @Param('numContrat', ParseIntPipe) numContrat: number,
    @Body('status', new ParseEnumPipe(['valide', 'invalide'])) nouveauStatus: 'valide' | 'invalide'
  ): Promise<{
    success: boolean;
    statusCode: number;
    message: string;
    data?: FullContratResponse | null; // Ajout de null comme type possible
    error?: string;
  }> {
    try {
      const updatedContrat = await this.contratAutoService.updateContratStatus(numContrat, nouveauStatus);
      
      if (!updatedContrat) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Contrat non trouvé',
          data: null
        };
      }
  
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: `Statut du contrat mis à jour avec succès vers '${nouveauStatus}'`,
        data: updatedContrat as unknown as FullContratResponse // Conversion de type si nécessaire
      };
    } catch (error) {
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Échec de la mise à jour du statut du contrat',
        error: error.message
      };
    }
  }
}