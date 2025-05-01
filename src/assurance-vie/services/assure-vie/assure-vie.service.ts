import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssureVie } from 'src/assurance-vie/entities/AssureVie.entity';
import { ContratVie } from 'src/assurance-vie/entities/contrat-vie.entity';
import { User } from 'src/auth/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class AssureVieService {
     constructor(
        @InjectRepository(AssureVie)
        private assureVieRepository: Repository<AssureVie>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(ContratVie)
        private contratVieRepository: Repository<ContratVie>,
      ) {}
    async getAllAssuresVie(): Promise<any[]> {
        // Récupérer tous les assurés vie avec leurs relations
        const assuresVie = await this.assureVieRepository.find({
          relations: {
            user: {
              adresse: true
            }
          }
        });
      
        if (assuresVie.length === 0) {
          return [];
        }
      
        // Mapper les résultats pour avoir un format cohérent
        return assuresVie.map(assureVie => {
          return {
            assureVie: {
              numSouscription: assureVie.numSouscription,
              situationProfessionnelle: assureVie.situationProfessionnelle,
              revenuMensuel: assureVie.revenuMensuel,
            },
            user: {
              id: assureVie.user.id,
              nom: assureVie.user.nom,
              prenom: assureVie.user.prenom,
              Cin: assureVie.user.Cin,
              telephone: assureVie.user.telephone,
              email: assureVie.user.email,
              date_naissance: assureVie.user.date_naissance,
              role: assureVie.user.role,
              isBlocked: assureVie.user.isBlocked,
            },
            adresse: assureVie.user.adresse ? {
              rue: assureVie.user.adresse.rue,
              numMaison: assureVie.user.adresse.numMaison,
              ville: assureVie.user.adresse.ville,
              gouvernat: assureVie.user.adresse.gouvernat,
              codePostal: assureVie.user.adresse.codePostal,
              pays: assureVie.user.adresse.pays,
            } : null
          };
        });
      }
      async searchAssuresByCin(cin: string): Promise<any[]> {
        return this.assureVieRepository
          .createQueryBuilder('assureVie')
          .leftJoinAndSelect('assureVie.user', 'user')
          .leftJoinAndSelect('user.adresse', 'adresse')
          .where('user.Cin = :cin', { cin })
          .getMany()
          .then(results => {
            return results.map(assureVie => ({
              assureVie: {
                numSouscription: assureVie.numSouscription,
                situationProfessionnelle: assureVie.situationProfessionnelle,
                revenuMensuel: assureVie.revenuMensuel,
              },
              user: {
                id: assureVie.user.id,
                nom: assureVie.user.nom,
                prenom: assureVie.user.prenom,
                Cin: assureVie.user.Cin,
                telephone: assureVie.user.telephone,
                email: assureVie.user.email,
                date_naissance: assureVie.user.date_naissance,
                role: assureVie.user.role,
                isBlocked: assureVie.user.isBlocked,
              },
              adresse: assureVie.user.adresse ? {
                rue: assureVie.user.adresse.rue,
                numMaison: assureVie.user.adresse.numMaison,
                ville: assureVie.user.adresse.ville,
                gouvernat: assureVie.user.adresse.gouvernat,
                codePostal: assureVie.user.adresse.codePostal,
                pays: assureVie.user.adresse.pays,
              } : null
            }));
        
          
          });
      }
   
    
}