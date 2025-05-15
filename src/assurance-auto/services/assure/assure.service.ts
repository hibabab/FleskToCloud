import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssureDto } from 'src/assurance-auto/dto/assure.dto';
import { Assure } from 'src/assurance-auto/entities/assure.entity';
import { Repository } from 'typeorm';


@Injectable()
export class AssureService {
  constructor(
    @InjectRepository(Assure)
    private readonly assureRepository: Repository<Assure>,
  ) {}

  async createAssure(dto: AssureDto): Promise<Assure> {
    const assure = this.assureRepository.create(dto);
    return await this.assureRepository.save(assure);
  }
  async getAssureByCin(cin: number): Promise<Assure> {
    try {
      const assure = await this.assureRepository.findOne({
        where: {
          user: {
            Cin: cin
          }
        },
        relations: ['user'] // Charge la relation user
      });

      if (!assure) {
        throw new NotFoundException(`Aucun assuré trouvé avec le CIN ${cin}`);
      }

      return assure;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erreur lors de la recherche de l'assuré avec le CIN ${cin}`,
        error.message
      );
    }
  }

  async updateAssure( NumSouscription: number, dto: Partial<AssureDto>): Promise<Assure> {
    const assure = await this.assureRepository.findOneBy({  NumSouscription });
    if (!assure) {
      throw new Error(`Assure with ID ${ NumSouscription} not found`);
    }
    Object.assign(assure, dto);

    return await this.assureRepository.save(assure);
  }

  async deleteAssure(id: number): Promise<void> {
    await this.assureRepository.delete(id);
  }

  async getAllAssures(): Promise<Assure[]> {
    return await this.assureRepository.find();
  }

  async getAssureById( NumSouscription: number): Promise<Assure> {
    const assure = await this.assureRepository.findOneBy({  NumSouscription });
    if (!assure) {
      throw new Error(`Assure with ID ${ NumSouscription} not found`);
    }
  
    return assure;
  }
  async getAssuresCount(): Promise<number> {
    try {
      return await this.assureRepository.count();
    } catch (error) {
      throw new InternalServerErrorException(
        'Erreur lors du comptage des assurés',
        error.message
      );
    }
  }
}
