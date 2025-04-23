import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
import { CreateAgentServiceDto, UpdateAgentServiceDto } from 'src/gestion-utilisateur/dto/agent-service.dto';
import { AgentServiceService } from 'src/gestion-utilisateur/services/agent-service/agent-service.service';
  
  @Controller('agent-service')
  export class AgentServiceController {
    constructor(private readonly agentServiceService: AgentServiceService) {}
  
    // Récupère tous les agents de service
    @Get()
    async getAllAgentServices() {
      try {
        return await this.agentServiceService.getAllAgentServices();
      } catch (error) {
        throw new NotFoundException(error.message);
      }
    }
    // Compte le nombre d'agents de service
    @Get('count')
    async countAgentServices() {
      try {
        return await this.agentServiceService.countAgentServices();
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
    // Récupère un agent de service par son ID
    @Get(':id')
    async getAgentById(@Param('id') id: number) {
      try {
        return await this.agentServiceService.getAgentById(id);
      } catch (error) {
        throw new NotFoundException(error.message);
      }
    }
  
    // Crée un nouvel agent de service
    @Post('addAgentService')
    async createAgentService(
      @Body() createAgentServiceDto: CreateAgentServiceDto,
    ) {
      try {
        return await this.agentServiceService.createAgentService({
          userId: createAgentServiceDto.userId,
          agentServiceData: {
            specialite: createAgentServiceDto.specialite,
            dateEmbauche:new Date(createAgentServiceDto.dateEmbauche),
          },
        });
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  
    // Met à jour un agent de service
    // @Put(':id')
    // async updateAgentService(
    //   @Param('id') id: number,
    //   @Body() updateAgentServiceDto: UpdateAgentServiceDto,
    // ) {
    //   try {
    //     return await this.agentServiceService.updateAgentService({
    //       id,
    //       agentServiceData: updateAgentServiceDto,
    //     });
    //   } catch (error) {
    //     throw new BadRequestException(error.message);
    //   }
    // }
  
    // Supprime un agent de service
    @Delete(':id')
    async deleteAgentService(@Param('id') id: number) {
      try {
        return await this.agentServiceService.deleteAgentService(id);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  
  
  
    // Récupère l'ID d'un agent de service à partir de l'ID utilisateur
    @Get('agentIdByUserId/:userId')
    async getAgentIdByUserId(@Param('userId') userId: number) {
      try {
        return await this.agentServiceService.getAgentIdByUserId(userId);
      } catch (error) {
        throw new NotFoundException(error.message);
      }
    }
  
    // Associe un constat à un agent de service
    @Post(':agentId/addConstat/:constatId')
    async ajouterConstatAgent(
      @Param('agentId') agentId: number,
      @Param('constatId') constatId: number,
    ) {
      try {
        return await this.agentServiceService.ajouterConstatAgent(
          agentId,
          constatId,
        );
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  }