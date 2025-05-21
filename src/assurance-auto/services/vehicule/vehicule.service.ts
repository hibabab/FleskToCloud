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

  // 🔗 Ajouter un constat à un véhicule
  async ajouterConstatAuVehicule(
    vehiculeId: number,
    constatId: number,
  ): Promise<Vehicule> {
    try {
      // Rechercher le véhicule avec ses constats
      const vehicule = await this.vehiculeRepository.findOne({
        where: { id: vehiculeId },
        relations: ['constats'],
      });

      if (!vehicule) {
        throw new NotFoundException(
          `Véhicule avec l'ID ${vehiculeId} non trouvé`,
        );
      }

      // Rechercher le constat
      const constat = await this.constatRepository.findOne({
        where: { idConstat: constatId },
      });

      if (!constat) {
        throw new NotFoundException(
          `Constat avec l'ID ${constatId} non trouvé`,
        );
      }

      // Initialiser le tableau si nécessaire
      if (!vehicule.constats) {
        vehicule.constats = [];
      }

      // Ajouter le constat s’il n’est pas déjà présent
      const constatExists = vehicule.constats.some(
        (existingConstat) => existingConstat.idConstat === constatId,
      );

      if (!constatExists) {
        vehicule.constats.push(constat);
      }

      // Définir le véhicule dans le constat (relation bidirectionnelle)
      constat.vehicule = vehicule;
      await this.constatRepository.save(constat);

      // Sauvegarder le véhicule mis à jour
      return await this.vehiculeRepository.save(vehicule);
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
