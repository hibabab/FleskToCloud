import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdresseDto } from 'src/auth/dto/adresse.dto';
import { Adresse } from 'src/auth/entities/adresse.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdresseService {
  constructor(
    @InjectRepository(Adresse)
    private readonly adresseRepository: Repository<Adresse>,
  ) {}

  async findOrCreate(adresseDTO: AdresseDto): Promise<Adresse> {
    let adresse = await this.adresseRepository.findOne({
      where: {
        rue: adresseDTO.rue,
        ville: adresseDTO.ville,
        gouvernat: adresseDTO.gouvernat,
        codePostal: adresseDTO.codePostal,
        pays: adresseDTO.pays,
      },
    });

    if (!adresse) {
      adresse = this.adresseRepository.create(adresseDTO);
      adresse = await this.adresseRepository.save(adresse);
    }

    return adresse;
  }
}
