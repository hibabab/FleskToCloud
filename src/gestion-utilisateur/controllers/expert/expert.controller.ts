import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateExpertDto } from 'src/gestion-utilisateur/dto/create-expert.dto';
import { UpdateExpertDto } from 'src/gestion-utilisateur/dto/update-expert.dto';
import { ExpertService } from 'src/gestion-utilisateur/services/expert/expert.service';

@Controller('expert')
export class ExpertController {
  constructor(private readonly expertService: ExpertService) {}

  @Get()
  async getAllExperts() {
    try {
      return await this.expertService.getAllExperts();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new NotFoundException(error.message);
    }
  }

  @Get('user/:userId/expert-id')
  async getExpertIdByUserId(@Param('userId') userId: number) {
    try {
      return await this.expertService.getExpertIdByUserId(userId);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new NotFoundException(error.message);
    }
  }

  @Get('specialite/:specialite')
  async getExpertsBySpecialite(@Param('specialite') specialite: string) {
    try {
      const experts =
        await this.expertService.getExpertsBySpecialite(specialite);
      if (!experts || experts.length === 0) {
        throw new NotFoundException(
          `Aucun expert trouvé avec la spécialité ${specialite}`,
        );
      }
      return experts;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(error.message);
    }
  }

  @Post('addExpert')
  async createExpert(@Body() createExpertDto: CreateExpertDto) {
    try {
      return await this.expertService.createExpert({
        userId: createExpertDto.userId,
        expertData: {
          disponibilite: createExpertDto.disponibilite,
          nbAnneeExperience: createExpertDto.nbAnneeExperience,
          specialite: createExpertDto.specialite,
          dateInscri: new Date(createExpertDto.dateInscri),
        },
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id')
  async updateExpert(
    @Param('id') id: number,
    @Body() updateExpertDto: UpdateExpertDto,
  ) {
    try {
      return await this.expertService.updateExpert({
        id,
        expertData: updateExpertDto,
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  async deleteExpert(@Param('id') id: number) {
    try {
      return await this.expertService.deleteExpert(id);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(error.message);
    }
  }

  @Get('count')
  async countExperts() {
    try {
      return await this.expertService.countExperts();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new NotFoundException(error.message);
    }
  }

  @Get(':expertId/constats')
  async getConstatsByExpertId(@Param('expertId') expertId: number) {
    try {
      return await this.expertService.getConstatsByExpertId(expertId);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new NotFoundException(error.message);
    }
  }

  @Post(':expertId/addConstat')
  async ajouterConstatAExpert(
    @Param('expertId') expertId: number,
    @Body('constatId') constatId: number,
  ) {
    try {
      return await this.expertService.ajouterConstatAExpert(
        expertId,
        constatId,
      );
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id/disponibilite')
  async updateExpertDisponibilite(
    @Param('id') expertId: number,
    @Query('disponibilite') disponibilite: boolean,
  ) {
    try {
      return await this.expertService.updateExpertDisponibilite(
        expertId,
        disponibilite,
      );
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(error.message);
    }
  }
  // Ajouter ces endpoints dans la classe ExpertController

// 1. Spécialité seule
@Get('specialite')
async getBySpecialite(@Query('specialite') specialite: string) {
  return this.expertService.getAvailableExpertsBySpecialite(specialite);
}

// 2. Expérience seule
@Get('sorted/experience')
async getSortedByExperience() {
  return this.expertService.getAvailableExpertsSortedByExperience();
}

// 3. Combinaison spécialité + expérience
@Get('specialite-sorted')
async getSpecialiteSorted(@Query('specialite') specialite: string) {
  return this.expertService.getAvailableExpertsBySpecialiteSorted(specialite);
}
@Get(':id')
async getExpertById(@Param('id') id: number) {
  try {
    return await this.expertService.getExpertById(id);
  } catch (error) {
    throw new NotFoundException(error.message);
  }
}
}
