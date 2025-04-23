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
        throw new NotFoundException(error.message);
      }
    }
  
    @Get('user/:userId/expert-id')
    async getExpertIdByUserId(@Param('userId') userId: number) {
      try {
        return await this.expertService.getExpertIdByUserId(userId);
      } catch (error) {
        throw new NotFoundException(error.message);
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
        throw new BadRequestException(error.message);
      }
    }
  
    @Delete(':id')
    async deleteExpert(@Param('id') id: number) {
      try {
        return await this.expertService.deleteExpert(id);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  
    @Get('count')
    async countExperts() {
      try {
        return await this.expertService.countExperts();
      } catch (error) {
        throw new NotFoundException(error.message);
      }
    }
  
    @Get(':expertId/constats')
    async getConstatsByExpertId(@Param('expertId') expertId: number) {
      try {
        return await this.expertService.getConstatsByExpertId(expertId);
      } catch (error) {
        throw new NotFoundException(error.message);
      }
    }
  
    @Post(':expertId/addConstat')
    async ajouterConstatAExpert(
      @Param('expertId') expertId: number,
      @Body('constatId') constatId: number,
    ) {
      try {
        return await this.expertService.ajouterConstatAExpert(expertId, constatId);
      } catch (error) {
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
        throw new BadRequestException(error.message);
      }
    }
  }