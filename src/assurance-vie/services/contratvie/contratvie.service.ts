import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAssureVieDto } from 'src/assurance-vie/dto/assureVie.dto';
import { CreateContratVieDto } from 'src/assurance-vie/dto/create-contrat-vie.dto';
import { CreateEmpruntDto } from 'src/assurance-vie/dto/emprunt.dto';
import { AssureVie } from 'src/assurance-vie/entities/AssureVie.entity';
import { ContratVie } from 'src/assurance-vie/entities/contrat-vie.entity';
import { Emprunt } from 'src/assurance-vie/entities/Emprunt.entity';
import { User } from 'src/auth/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ContratvieService {
  constructor(
    @InjectRepository(AssureVie)
    private assureVieRepository: Repository<AssureVie>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Emprunt)
    private readonly empruntRepository: Repository<Emprunt>,
    private readonly entityManager: EntityManager,
    @InjectRepository(ContratVie)
    private contratVieRepository: Repository<ContratVie>,
  ) {}

  async createContratVie(
    Cin: number,
    createAssureVieDto: CreateAssureVieDto,
    createContratVieDto: CreateContratVieDto,
    createEmpruntDto: CreateEmpruntDto
  ): Promise<ContratVie> {
const assureVieExist = await this.assureVieRepository
.createQueryBuilder('assureVie')
.innerJoin('assureVie.user', 'user')
.where('user.Cin = :Cin', { Cin })
.getOne();

let assureVie: AssureVie;

if (assureVieExist) {
// Mise à jour complète de toutes les propriétés de l'assuré existant
assureVie = Object.assign(assureVieExist, createAssureVieDto);

// Sauvegarde avec gestion d'erreur
try {
  await this.assureVieRepository.save(assureVie);
} catch (error) {
  throw new Error('Échec de la mise à jour des informations de l\'assuré');
}
} else {
// Création d'un nouvel assuré
const user = await this.userRepository.findOne({ where: { Cin } });
if (!user) {
  throw new NotFoundException(`Utilisateur avec CIN ${Cin} non trouvé`);
}

assureVie = this.assureVieRepository.create({
  ...createAssureVieDto,
  user, 

});

try {
  await this.assureVieRepository.save(assureVie);
} catch (error) {
  throw new Error('Échec de la création du nouvel assuré');
}
}
    // Création de l'emprunt
    const emprunt = this.empruntRepository.create({
      organismePreteur: createEmpruntDto.organismePreteur,
      montantPret: createEmpruntDto.montantPret,
      dateEffet: createEmpruntDto.dateEffet,
      datePremierR: createEmpruntDto.datePremierR,
      dateDernierR: createEmpruntDto.dateDernierR,
      typeAmortissement: createEmpruntDto.typeAmortissement,
      periodiciteAmortissement: createEmpruntDto.periodiciteAmortissement,
      tauxInteret: createEmpruntDto.tauxInteret,
    });
  
    // Création du contrat vie
    const contratVie = this.contratVieRepository.create({
      assureVie,
      cotisation: createContratVieDto.cotisation,
      dateEffet: createContratVieDto.dateEffet,
      dateExpiration:new Date(createEmpruntDto.dateDernierR),
      garanties: createContratVieDto.garanties,
      etat: createContratVieDto.etat || 'valide',
      emprunt, // On associe l'emprunt créé
    });
  
    // Sauvegarde en transaction pour garantir l'intégrité des données
    return this.entityManager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(emprunt);
      return await transactionalEntityManager.save(contratVie);
    });
  }

  async getContratVieDetails(numContrat: number): Promise<any> {
    const contratVie = await this.contratVieRepository.findOne({
      where: { numero: numContrat },
      relations: {
        emprunt: true,  // Ajoutez cette ligne
        assureVie: {
          user: {
            adresse: true
          }
        }
      }
    });
  
    if (!contratVie) {
      throw new NotFoundException(`Contrat vie avec numéro ${numContrat} non trouvé`);
    }
  
    return {
      contratVie: {
        numero: contratVie?.numero || null,
        garanties: contratVie?.garanties || null,
        cotisation: contratVie?.cotisation || null,
        dateEffet: contratVie?.dateEffet || null,
        dateExpiration: contratVie?.dateExpiration || null,
      },
      emprunt: contratVie?.emprunt ? {
        organismePreteur: contratVie.emprunt?.organismePreteur || null,
        montantPret: contratVie.emprunt?.montantPret || null,
        dateEffet: contratVie.emprunt?.dateEffet || null,
        datePremierR: contratVie.emprunt?.datePremierR || null,
        dateDernierR: contratVie.emprunt?.dateDernierR || null,
        typeAmortissement: contratVie.emprunt?.typeAmortissement || null,
        periodiciteAmortissement: contratVie.emprunt?.periodiciteAmortissement || null,
        tauxInteret: contratVie.emprunt?.tauxInteret || null,
      } : null,
      assureVie: contratVie?.assureVie ? {
        numSouscription: contratVie.assureVie?.numSouscription || null,
        situationProfessionnelle: contratVie.assureVie?.situationProfessionnelle || null,
        revenuMensuel: contratVie.assureVie?.revenuMensuel || null,
      } : null,
      user: contratVie?.assureVie?.user ? {
        id: contratVie.assureVie.user?.id || null,
        nom: contratVie.assureVie.user?.nom || null,
        prenom: contratVie.assureVie.user?.prenom || null,
        Cin: contratVie.assureVie.user?.Cin || null,
        telephone: contratVie.assureVie.user?.telephone || null,
        email: contratVie.assureVie.user?.email || null,
        date_naissance: contratVie.assureVie.user?.date_naissance || null,
        role: contratVie.assureVie.user?.role || null,
        isBlocked: contratVie.assureVie.user?.isBlocked || false, // Valeur par défaut false
      } : null,
      adresse: contratVie?.assureVie?.user?.adresse ? {
        rue: contratVie.assureVie.user.adresse?.rue || null,
        numMaison: contratVie.assureVie.user.adresse?.numMaison || null,
        ville: contratVie.assureVie.user.adresse?.ville || null,
        gouvernat: contratVie.assureVie.user.adresse?.gouvernat || null,
        codePostal: contratVie.assureVie.user.adresse?.codePostal || null,
        pays: contratVie.assureVie.user.adresse?.pays || null,
      } : null
    };
  }
  // Ajouter cette méthode dans la classe ContratvieService existante

  async getContratsByCin(Cin: number): Promise<any[]> {
    // Vérifier d'abord si l'utilisateur existe avec ce CIN
    const user = await this.userRepository.findOne({ 
      where: { Cin } 
    });
  
    if (!user) {
      throw new NotFoundException(`Utilisateur avec CIN ${Cin} non trouvé`);
    }
  
    // Récupérer l'assuré vie lié à cet utilisateur
    const assureVie = await this.assureVieRepository.findOne({
      where: { user: { id: user.id } },
      relations: { user: true }
    });
  
    if (!assureVie) {
      throw new NotFoundException(`Aucun assuré vie trouvé pour le CIN ${Cin}`);
    }
  
    // Récupérer tous les contrats vie de cet assuré avec les relations
    const contratsVie = await this.contratVieRepository.find({
      where: { assureVie: { numSouscription: assureVie.numSouscription } },
      relations: {
        assureVie: {
          user: {
            adresse: true
          }
        },
        emprunt: true // Assurez-vous de charger la relation emprunt
      }
    });
  
    if (contratsVie.length === 0) {
      return [];
    }
  
    // Mapper les résultats pour avoir un format cohérent
    return contratsVie.map(contratVie => {
      // Gestion de l'emprunt optionnel
      const empruntData = contratVie.emprunt ? {
        organismePreteur: contratVie.emprunt.organismePreteur,
        montantPret: contratVie.emprunt.montantPret,
        dateEffet: contratVie.emprunt.dateEffet,
        datePremierR: contratVie.emprunt.datePremierR,
        dateDernierR: contratVie.emprunt.dateDernierR,
        typeAmortissement: contratVie.emprunt.typeAmortissement,
        periodiciteAmortissement: contratVie.emprunt.periodiciteAmortissement,
        tauxInteret: contratVie.emprunt.tauxInteret
      } : null;

      return {
        contratVie: {
          id: contratVie.numero,
          numero: contratVie.numero,
          garanties: contratVie.garanties,
          cotisation: contratVie.cotisation,
          dateEffet:contratVie.dateEffet,
        dateExpiration:contratVie.dateExpiration,
      
        },
        emprunt: empruntData, // Utilisation des données d'emprunt conditionnelles
        assureVie: {
          id: assureVie.numSouscription,
          numSouscription: contratVie.assureVie.numSouscription,
          situationProfessionnelle: contratVie.assureVie.situationProfessionnelle,
          revenuMensuel: contratVie.assureVie.revenuMensuel,
        },
        user: {
          id: contratVie.assureVie.user.id,
          nom: contratVie.assureVie.user.nom,
          prenom: contratVie.assureVie.user.prenom,
          Cin: contratVie.assureVie.user.Cin,
          telephone: contratVie.assureVie.user.telephone,
          email: contratVie.assureVie.user.email,
          date_naissance: contratVie.assureVie.user.date_naissance,
          role: contratVie.assureVie.user.role,
          isBlocked: contratVie.assureVie.user.isBlocked,
        },
        adresse: {
          rue: contratVie.assureVie.user.adresse?.rue || null,
          numMaison: contratVie.assureVie.user.adresse?.numMaison || null,
          ville: contratVie.assureVie.user.adresse?.ville || null,
          gouvernat: contratVie.assureVie.user.adresse?.gouvernat || null,
          codePostal: contratVie.assureVie.user.adresse?.codePostal || null,
          pays: contratVie.assureVie.user.adresse?.pays || null
        }
      };
    });
  }
  private async updateContratVieStatus(numero: number, etat: 'valide' | 'invalide'): Promise<ContratVie> {
    const contratVie = await this.contratVieRepository.findOne({ 
      where: { numero: numero } 
    });
  
    if (!contratVie) {
      throw new NotFoundException(`Contrat vie avec le numéro ${numero} non trouvé`);
    }
  
    contratVie.etat = etat;
    return await this.contratVieRepository.save(contratVie);
  }
// Méthode pour valider spécifiquement un contrat
async validateContratVie(numero: number): Promise<any> {
  try {
    const updatedContrat = await this.updateContratVieStatus(numero, 'valide');
    return {
      success: true,
      data: updatedContrat,
      message: 'Contrat vie validé avec succès'
    };
  } catch (error) {
    return {
      success: false,
      message: `Erreur lors de la validation du contrat vie: ${error.message}`
    };
  }
}

// Méthode pour invalider un contrat
async invalidateContratVie(numero: number): Promise<ContratVie> {
    return this.updateContratVieStatus(numero, 'invalide');
}
}