import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conducteur } from '../entities/conducteur.entity';
import { AdresseService } from './adresse-service.service';
import { ConducteurDto } from '../dto/conducteur.dto';
@Injectable()
export class ConducteurService {
  constructor(
    @InjectRepository(Conducteur)
    private readonly conducteurRepository: Repository<Conducteur>,
    private readonly adresseService: AdresseService, // Injecte le service Adresse
  ) {}

  async create(conducteurDto: ConducteurDto): Promise<Conducteur> {
    console.log('🔎 Conducteur DTO reçu:', conducteurDto);

    // Vérifier et créer l'adresse si elle n'existe pas
    const adresse = await this.adresseService.findOrCreate(
      conducteurDto.adresse,
    );

    // Créer l'instance de Conducteur en incluant l'adresse
    const conducteur = this.conducteurRepository.create({
      ...conducteurDto,
      adresse, // Associer l'adresse trouvée ou créée
    });

    // Sauvegarder le conducteur dans la base de données
    console.log('✅ Conducteur avant save:', conducteur);

    return await this.conducteurRepository.save(conducteur);
  }
}
