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

  async getExpertsBySpecialite(specialite: string): Promise<Expert[]> {
    try {
      return await this.expertRepository.find({
        where: { specialite },
        relations: ['user', 'user.adresse'],
      });
    } catch (error) {
      console.error(
        `❌ Erreur lors de la récupération des experts avec la spécialité ${specialite}:`,
        error,
      );
      throw new InternalServerErrorException(
        `Erreur interne lors de la récupération des experts avec la spécialité ${specialite}`,
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

      return expert.constats ?? [];
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
      const expert = await this.expertRepository.findOne({
        where: { id: expertId },
        relations: ['constats'],
      });

      if (!expert) {
        throw new NotFoundException(`Expert avec l'id ${expertId} non trouvé`);
      }

      if (!expert.constats) {
        expert.constats = [];
      }

      const constat = await this.constatRepository.findOne({
        where: { idConstat: constatId },
      });

      if (!constat) {
        throw new NotFoundException(
          `Constat avec l'id ${constatId} non trouvé`,
        );
      }

      expert.constats.push(constat);
      constat.expert = expert;

      await this.expertRepository.save(expert);
      await this.constatRepository.save(constat);

      return {
        ...expert,
        constats: expert.constats.map((c) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { expert, ...rest } = c;
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

  async getExpertById2(id: number): Promise<Expert> {
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
 // 🔍 1. Experts disponibles par spécialité (sans tri)
async getAvailableExpertsBySpecialite(specialite: string): Promise<Expert[]> {
  try {
    return await this.expertRepository.find({
      where: { 
        disponibilite: true,
        specialite 
      },
      relations: ['user', 'user.adresse']
    });
  } catch (error) {
    throw new InternalServerErrorException('Erreur de filtrage par spécialité');
  }
}

// 📈 2. Experts disponibles triés par expérience (sans filtre)
async getAvailableExpertsSortedByExperience(): Promise<Expert[]> {
  try {
    return await this.expertRepository.find({
      where: { disponibilite: true },
      relations: ['user', 'user.adresse'],
      order: { nbAnneeExperience: 'DESC' } // Tri unique par expérience
    });
  } catch (error) {
    throw new InternalServerErrorException('Erreur de tri par expérience');
  }
}

// 🎯 3. Experts disponibles par spécialité ET triés par expérience
async getAvailableExpertsBySpecialiteSorted(specialite: string): Promise<Expert[]> {
  try {
    return await this.expertRepository.find({
      where: { 
        disponibilite: true,
        specialite 
      },
      relations: ['user', 'user.adresse'],
      order: { nbAnneeExperience: 'DESC' }
    });
  } catch (error) {
    throw new InternalServerErrorException('Erreur de filtrage et tri combinés');
  }
}
async getExpertById(userId: number): Promise<Expert> {
    const expertId = await this.getExpertIdByUserId(userId);
    const expert = await this.expertRepository.findOne({
      where: { id: expertId },
      relations: ['user', 'constats','user.adresse'],
    });

    if (!expert) {
      throw new NotFoundException(`Agent avec l'ID ${expertId} non trouvé`);
    }

    return expert;
  }
  
}
