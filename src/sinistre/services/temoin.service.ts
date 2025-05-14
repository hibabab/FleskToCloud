import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Temoin } from '../entities/temoin.entity';
import { AdresseService } from './adresse-service.service';
import { TemoinDto } from '../dto/temoin.dto';

@Injectable()
export class TemoinService {
  constructor(
    @InjectRepository(Temoin)
    private readonly temoinRepository: Repository<Temoin>,
    private readonly adresseService: AdresseService, // Injection du service AdresseService
  ) {}

  async findByDetails(temoinDto: TemoinDto): Promise<Temoin | null> {
    return await this.temoinRepository.findOne({
      where: { nom: temoinDto.nom, prenom: temoinDto.prenom },
    });
  }

  async create(temoinDto: TemoinDto): Promise<Temoin> {
    // Trouver ou créer l'adresse
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const adresse = await this.adresseService.findOrCreate(temoinDto.adresse);

    // Créer le témoin avec l'adresse obtenue
    const temoin = this.temoinRepository.create({
      ...temoinDto,
      adresse, // Associer l'adresse trouvée ou créée
    });

    return await this.temoinRepository.save(temoin);
  }
}
