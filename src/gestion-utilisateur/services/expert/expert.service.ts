import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Expert } from 'src/gestion-utilisateur/entities/Expert.entity';
import { constat } from 'src/sinistre/entities/constat.entity';
  import { Repository } from 'typeorm';
  
  
  @Injectable()
  export class ExpertService {
    constructor(
      @InjectRepository(Expert)
      private readonly expertRepository: Repository<Expert>,
  
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      @InjectRepository(constat)
      private readonly constatRepository: Repository<constat>,
    ) {}
  
    // 🔍 Récupère tous les experts avec leur utilisateur associé
    async getAllExperts(): Promise<Expert[]> {
      try {
        return await this.expertRepository.find({
          relations: ['user', 'user.adresse'],
        });
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des experts:', error);
        throw new InternalServerErrorException(
          'Erreur interne lors de la récupération des experts',
        );
      }
    }
  
    // ➕ Crée un nouvel expert
    async createExpert(data: {
      userId: number;
      expertData: {
        disponibilite: boolean;
        nbAnneeExperience: number;
        specialite: string;
        dateInscri: Date;
      };
    }): Promise<Expert> {
      const { userId, expertData } = data;
  
      try {
        const user = await this.userRepository.findOne({ where: { id: userId } });
  
        if (!user) {
          throw new NotFoundException(
            `Utilisateur avec l'id ${userId} non trouvé`,
          );
        }
  
        const expert = this.expertRepository.create({
          ...expertData,
          user,
        });
  
        return await this.expertRepository.save(expert);
      } catch (error) {
        console.error("❌ Erreur lors de la création de l'expert:", error);
        throw new InternalServerErrorException(
          "Erreur interne lors de la création de l'expert",
        );
      }
    }
  
    // ✏️ Met à jour un expert existant
    async updateExpert(data: {
      id: number;
      expertData: Partial<Expert>;
    }): Promise<Expert> {
      const { id, expertData } = data;
  
      try {
        const expert = await this.expertRepository.findOne({
          where: { id },
          relations: ['user'],
        });
  
        if (!expert) {
          throw new NotFoundException(`Expert avec l'id ${id} non trouvé`);
        }
  
        Object.assign(expert, expertData);
        return await this.expertRepository.save(expert);
      } catch (error) {
        console.error("❌ Erreur lors de la mise à jour de l'expert:", error);
        throw new InternalServerErrorException(
          "Erreur interne lors de la mise à jour de l'expert",
        );
      }
    }
  
    // ❌ Supprime un expert
    async deleteExpert(id: number): Promise<void> {
      try {
        const expert = await this.expertRepository.findOne({ where: { id } });
  
        if (!expert) {
          throw new NotFoundException(`Expert avec l'id ${id} non trouvé`);
        }
  
        await this.expertRepository.delete(id);
      } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'expert:", error);
        throw new InternalServerErrorException(
          "Erreur interne lors de la suppression de l'expert",
        );
      }
    }
  
    // 📊 Nombre total d'experts
    async countExperts(): Promise<number> {
      try {
        return await this.expertRepository.count();
      } catch (error) {
        console.error('❌ Erreur lors du comptage des experts:', error);
        throw new InternalServerErrorException(
          'Erreur interne lors du comptage des experts',
        );
      }
    }
    // 🚀 Méthode pour récupérer les constats d'un expert
    async getConstatsByExpertId(expertId: number): Promise<constat[]> {
      try {
        const expert = await this.expertRepository.findOne({
          where: { id: expertId },
          relations: ['constats'],
        });
  
        if (!expert) {
          throw new NotFoundException(`Expert avec l'id ${expertId} non trouvé`);
        }
  
        return expert.constats ?? []; // ✅ retourne tableau vide si undefined
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des constats:', error);
        throw new InternalServerErrorException(
          'Erreur interne lors de la récupération des constats',
        );
      }
    }
    async ajouterConstatAExpert(
      expertId: number,
      constatId: number,
    ): Promise<Expert> {
      try {
        // Trouver l'expert par son ID
        const expert = await this.expertRepository.findOne({
          where: { id: expertId },
          relations: ['constats'], // On charge les constats associés à l'expert
        });
  
        if (!expert) {
          throw new NotFoundException(`Expert avec l'id ${expertId} non trouvé`);
        }
        if (!expert.constats) {
          expert.constats = [];
        }
        // Trouver le constat par son ID
        const constat = await this.constatRepository.findOne({
          where: { idConstat: constatId },
        });
  
        if (!constat) {
          throw new NotFoundException(
            `Constat avec l'id ${constatId} non trouvé`,
          );
        }
  
        // Ajouter le constat à l'expert
        expert.constats.push(constat);
  
        // Ajouter l'expert au constat
        constat.expert = expert;
  
        // Sauvegarder les modifications dans la base de données
        await this.expertRepository.save(expert); // Sauvegarder l'expert avec les constats mis à jour
        await this.constatRepository.save(constat); // Sauvegarder le constat avec l'expert associé
  
        return {
          ...expert,
          constats: expert.constats.map((constat) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { expert, ...rest } = constat; // Exclut explicitement la propriété
            return rest;
          }),
        };
      } catch (error) {
        console.error("❌ Erreur lors de l'ajout du constat à l'expert:", error);
        throw new InternalServerErrorException(
          "Erreur interne lors de l'ajout du constat",
        );
      }
    }
    async getExpertById(id: number): Promise<Expert> {
      const expert = await this.expertRepository.findOne({
        where: { id },
        relations: ['user', 'constats'],
      });
      if (!expert) {
        throw new NotFoundException(`Expert avec l'ID ${id} non trouvé`);
      }
      return expert;
    }
    async getExpertIdByUserId(userId: number): Promise<number> {
      const expert = await this.expertRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });
  
      if (!expert) {
        throw new NotFoundException(
          `Aucun expert trouvé pour l'utilisateur avec l'ID ${userId}`,
        );
      }
  
      return expert.id;
    }
    // In expert.service.ts
    async updateExpertDisponibilite(
      expertId: number,
      disponibilite: boolean,
    ): Promise<void> {
      try {
        await this.expertRepository.update(expertId, { disponibilite });
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour de la disponibilité de l'expert:",
          error,
        );
        throw new InternalServerErrorException(
          "Erreur lors de la mise à jour de la disponibilité de l'expert",
        );
      }
    }
  }
  