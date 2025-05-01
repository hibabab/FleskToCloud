// src/agent-service/agent-service.service.ts
import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { AgentService } from 'src/gestion-utilisateur/entities/AgentService.entity';
import { constat } from 'src/sinistre/entities/constat.entity';
  import { Repository } from 'typeorm';
  
 
  
  @Injectable()
  export class AgentServiceService {
    constructor(
      @InjectRepository(AgentService)
      private readonly agentServiceRepository: Repository<AgentService>,
  
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
  
      @InjectRepository(constat)
      private readonly constatRepository: Repository<constat>,
    ) {}
  
    // Récupère tous les agents de service avec leur utilisateur associé
    async getAllAgentServices(): Promise<AgentService[]> {
      try {
        return await this.agentServiceRepository.find({ relations: ['user'] });
      } catch (error) {
        console.error(
          '❌ Erreur lors de la récupération des agents de service:',
          error,
        );
        throw new InternalServerErrorException(
          'Erreur interne lors de la récupération des agents de service',
        );
      }
    }
  
    // Crée un nouvel agent de service
    async createAgentService(data: {
      userId: number;
      agentServiceData: {
        specialite: string;
        dateEmbauche: Date;
      };
    }): Promise<AgentService> {
      const { userId, agentServiceData } = data;
  
      try {
        const user = await this.userRepository.findOne({ where: { id: userId } });
  
        if (!user) {
          throw new NotFoundException(
            `Utilisateur avec l'id ${userId} non trouvé`,
          );
        }
  
        const agentService = this.agentServiceRepository.create({
          ...agentServiceData,
          user,
        });
  
        return await this.agentServiceRepository.save(agentService);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la création de l'agent de service:",
          error,
        );
        throw new InternalServerErrorException(
          "Erreur interne lors de la création de l'agent de service",
        );
      }
    }
  
    // Met à jour un agent de service
    async updateAgentService(data: {
      id: number;
      agentServiceData: Partial<AgentService>;
    }): Promise<AgentService> {
      const { id, agentServiceData } = data;
  
      try {
        const agentService = await this.agentServiceRepository.findOne({
          where: { id },
          relations: ['user'],
        });
  
        if (!agentService) {
          throw new NotFoundException(
            `Agent de service avec l'id ${id} non trouvé`,
          );
        }
  
        Object.assign(agentService, agentServiceData);
        return await this.agentServiceRepository.save(agentService);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la mise à jour de l'agent de service:",
          error,
        );
        throw new InternalServerErrorException(
          "Erreur interne lors de la mise à jour de l'agent de service",
        );
      }
    }
  
    // Supprime un agent de service
    async deleteAgentService(id: number): Promise<void> {
      try {
        const agentService = await this.agentServiceRepository.findOne({
          where: { id },
        });
  
        if (!agentService) {
          throw new NotFoundException(
            `Agent de service avec l'id ${id} non trouvé`,
          );
        }
  
        await this.agentServiceRepository.delete(id);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la suppression de l'agent de service:",
          error,
        );
        throw new InternalServerErrorException(
          "Erreur interne lors de la suppression de l'agent de service",
        );
      }
    }
  
    // Compte les agents de service
    async countAgentServices(): Promise<number> {
      try {
        return await this.agentServiceRepository.count();
      } catch (error) {
        console.error('Erreur lors du comptage des agents de service:', error);
        throw new Error('Erreur lors du comptage des agents de service');
      }
    }
  
    // Récupère l'ID de l'agent à partir de l'ID utilisateur
    async getAgentIdByUserId(userId: number): Promise<number> {
      const agent = await this.agentServiceRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });
  
      if (!agent) {
        throw new NotFoundException(
          `Aucun agent trouvé pour l'utilisateur avec l'ID ${userId}`,
        );
      }
  
      return agent.id;
    }
  
    // Associe un constat à un agent de service
    async ajouterConstatAgent(
      agentId: number,
      constatId: number,
    ): Promise<AgentService> {
      try {
        const agent = await this.agentServiceRepository.findOne({
          where: { id: agentId },
          relations: ['constats'],
        });
  
        if (!agent) {
          throw new NotFoundException(`Agent avec l'id ${agentId} non trouvé`);
        }
  
        const constat = await this.constatRepository.findOne({
          where: { idConstat: constatId },
        });
  
        if (!constat) {
          throw new NotFoundException(
            `Constat avec l'id ${constatId} non trouvé`,
          );
        }
  
        // Initialiser constats si non défini
        if (!agent.constats) {
          agent.constats = [];
        }
  
        // Ajouter le constat à l'agent
        agent.constats.push(constat);
  
        // Lier l'agent au constat
        constat.agentService = agent;
  
        await this.agentServiceRepository.save(agent);
        await this.constatRepository.save(constat);
  
        return {
          ...agent,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          constats: agent.constats.map(({ agentService, ...rest }) => rest),
        } as AgentService;
      } catch (error) {
        console.error("❌ Erreur lors de l'ajout du constat à l'agent:", error);
        throw new InternalServerErrorException(
          "Erreur interne lors de l'ajout du constat",
        );
      }
    }
    async getAgentsBySpecialite(specialite: string): Promise<AgentService[]> {
      try {
        return await this.agentServiceRepository.find({
          where: { specialite },
          relations: ['user'],
        });
      } catch (error) {
        console.error(
          `❌ Erreur lors de la récupération des agents avec la spécialité ${specialite}:`,
          error,
        );
        throw new InternalServerErrorException(
          `Erreur interne lors de la récupération des agents avec la spécialité ${specialite}`,
        );
      }
    }
    async getAgentById(id: number): Promise<AgentService> {
      const agent = await this.agentServiceRepository.findOne({
        // Changed from expertRepository
        where: { id },
        relations: ['user', 'constats'],
      });
  
      if (!agent) {
        throw new NotFoundException(`Agent avec l'ID ${id} non trouvé`);
      }
  
      return agent;
    }
  }
  