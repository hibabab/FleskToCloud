import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { constat } from 'src/sinistre/entities/constat.entity';
import { Vehicule } from 'src/assurance-auto/entities/Vehicule.entity';

@Injectable()
export class VehiculeService {
  constructor(
    @InjectRepository(Vehicule)
    private readonly vehiculeRepository: Repository<Vehicule>,
    @InjectRepository(constat)
    private readonly constatRepository: Repository<constat>,
  ) {}

  // 🔍 Trouver un véhicule par son immatriculation
  async findByImmatriculation(imat: string): Promise<Vehicule> {
    try {
      const vehicule = await this.vehiculeRepository.findOne({
        where: { Imat: imat }, // Vérifiez que 'Imat' correspond au nom de champ dans l'entité
        relations: ['carteGrise', 'contratAuto', 'constats'],
      });

      if (!vehicule) {
        throw new NotFoundException(
          `Véhicule avec l'immatriculation ${imat} non trouvé`,
        );
      }

      return vehicule;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du véhicule :', error);
      throw new InternalServerErrorException(
        'Erreur interne lors de la récupération du véhicule',
      );
    }
  }

  // ➕ Ajouter un constat à un véhicule
  async ajouterConstatAuVehicule(
    vehiculeId: number,
    constatId: number,
  ): Promise<Vehicule> {
    try {
      const vehicule = await this.vehiculeRepository.findOne({
        where: { id: vehiculeId },
        relations: ['constats'],
      });

      if (!vehicule) {
        throw new NotFoundException(
          `Véhicule avec l'ID ${vehiculeId} non trouvé`,
        );
      }

      const cst = await this.constatRepository.findOne({
        where: { idConstat: constatId },
      });

      if (!cst) {
        throw new NotFoundException(
          `Constat avec l'ID ${constatId} non trouvé`,
        );
      }

      // Lier le constat au véhicule
      cst.vehicule = vehicule;

      // Sauvegarder la mise à jour du constat
      await this.constatRepository.save(cst);

      // Recharger le véhicule mis à jour avec les constats
      const updatedVehicule = await this.vehiculeRepository.findOne({
        where: { id: vehiculeId },
        relations: ['constats'],
      });

      if (!updatedVehicule) {
        throw new NotFoundException(
          `Véhicule avec l'ID ${vehiculeId} non trouvé après mise à jour.`,
        );
      }

      return updatedVehicule;
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'ajout du constat au véhicule :",
        error,
      );
      throw new InternalServerErrorException(
        "Erreur interne lors de l'ajout du constat au véhicule",
      );
    }
  }
}
