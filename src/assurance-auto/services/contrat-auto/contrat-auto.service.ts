import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssureDto } from 'src/assurance-auto/dto/assure.dto';
import { ContratAutoDto } from 'src/assurance-auto/dto/contratauto.dto';
import { CreateVehiculeDto } from 'src/assurance-auto/dto/vehicule.dto';
import { Assure } from 'src/assurance-auto/entities/assure.entity';
import { ContratAuto } from 'src/assurance-auto/entities/ContratAuto.entity';
import { Garanties } from 'src/assurance-auto/entities/Garanties.entity';
import { Vehicule } from 'src/assurance-auto/entities/Vehicule.entity';
import { User } from 'src/auth/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';

interface ContratDetails {
  num: string | number;
  dateSouscription: Date | string | null;
  dateExpiration: Date | string | null;
  echeances: Date | string | null;
  NatureContrat: string;
  typePaiement: string;
  cotisationNette: number;
  cotisationTotale: number;
  montantEcheance: number;
  packChoisi: string | undefined; 
}
 enum TypeGaranties {
  ResponsabiliteCivile = 'ResponsabiliteCivile',
  RTI = 'RTI',
  DefenseEtRecours = 'DefenseEtRecours',
  Incendie = 'Incendie',
  Vol = 'Vol',
  PersonneTransportees = 'PersonneTransportees',
  BrisDeGlaces = 'BrisDeGlaces',
  Tierce = 'Tierce',
  AssistanceAutomobile = 'AssistanceAutomobile',
  IndividuelAccidentConducteur = 'IndividuelAccidentConducteur',
  EVENEMENTCLIMATIQUE = 'Evènements climatiques',
  GREVESEMEUTESETMOUVEMENTPOPULAIRE = 'Grèves Emeutes et Mouvements populaires',
  DOMMAGEETCOLLIDION = 'Dommage et Collision'
}
interface UserDetails {
  id: number;
  nom: string;
  prenom: string;
  Cin: number;
  telephone: string;
  email: string;
  date_naissance: Date | string | null;
  adresse: AddressDetails | null;
}

interface AddressDetails {
    rue: string;
    numMaison: number | null;  
    ville: string;
    gouvernat: string;         
    codePostal: number;
    pays: string;
  }
  

interface AssureDetails {
  NumSouscription: number;
  bonusMalus: number;
  user: UserDetails;
}

interface VehiculeDetails {
  id: number;
  type: string;
  marque: string;
  model: string;
  Imat: string;
  energie: string;
  nbPlace: number;
  DPMC: Date | string | null;
  cylindree: string;
  chargeUtil: number;
  valeurNeuf: number;
  numChassis: string;
  poidsVide: number;
  puissance: number;
}

interface GarantieDetails {
  id: number;
  type: string;
 capital: number | null; // Accepter null
  cotisationNette: number;
  franchise: number;
}

 interface FullContratResponse {
  contrat: ContratDetails;
  assure: AssureDetails;
  vehicule: VehiculeDetails;
  garanties: GarantieDetails[];
}

@Injectable()
export class ContratAutoService {
  constructor(
    @InjectRepository(ContratAuto)
    private readonly contratAutoRepository: Repository<ContratAuto>,
    @InjectRepository(Assure)
    private readonly assureRepository: Repository<Assure>,
    @InjectRepository(Vehicule)
    private readonly vehiculeRepository: Repository<Vehicule>,
    @InjectRepository(Garanties)
    private readonly garantiesRepository: Repository<Garanties>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createCA(
    dtoA: AssureDto, 
    Cin: number,
    dtoV: CreateVehiculeDto, 
    dtoC: ContratAutoDto
  ): Promise<ContratAuto | null> {
    console.log('=== DEBUT createCA ===');
    console.log('Données reçues:', { dtoA, Cin, dtoV, dtoC });
  
    // 1. Vérification utilisateur
    console.log('Recherche de l\'utilisateur avec CIN:', Cin);
    let user = await this.userRepository.findOne({ where: { Cin } });
    if (!user) {
      console.error('Utilisateur non trouvé avec CIN:', Cin);
      throw new Error('Utilisateur non trouvé. Veuillez créer un compte.');
    }
    console.log('Utilisateur trouvé:', user.id);
  
   // 2. Vérification assure
console.log('Recherche de l\'assuré pour user:', user.id);
let assure = await this.assureRepository.findOne({ where: { user: { id: user.id } } });
if (!assure) {
  console.log('Création d\'un nouvel assuré');
  assure = this.assureRepository.create({
    user,
    bonusMalus: dtoA.bonusMalus,
  });
  assure = await this.assureRepository.save(assure);
  console.log('Nouvel assuré créé:', assure.NumSouscription);
} else {
  console.log('Assuré existant trouvé:', assure.NumSouscription);
  // Mise à jour du bonusMalus si l'assuré existe déjà
  assure.bonusMalus = dtoA.bonusMalus;
  assure = await this.assureRepository.save(assure);
  console.log('BonusMalus mis à jour pour l\'assuré existant');
}
  
    // 3. Vérification véhicule
    console.log('Recherche du véhicule avec Imat:', dtoV.Imat);
    let vehicule = await this.vehiculeRepository.findOne({ where: { Imat: dtoV.Imat } });
    if (!vehicule) {
      console.log('Création d\'un nouveau véhicule');
      vehicule = this.vehiculeRepository.create(dtoV);
      vehicule = await this.vehiculeRepository.save(vehicule);
      console.log('Nouveau véhicule créé:', vehicule.id);
    } else {
      console.log('Véhicule existant trouvé:', vehicule.id);
    }
  
    // 4. Création contrat
    console.log('Création du contrat auto');
    const contratAuto = this.contratAutoRepository.create({
      ...dtoC,
      etat: dtoC.etat || 'valide',
      assure,
      vehicule,
    });
    console.log('Contrat auto préparé:', contratAuto);
  
    // 5. Sauvegarde contrat
    console.log('Sauvegarde du contrat auto');
    const savedContratAuto = await this.contratAutoRepository.save(contratAuto);
    console.log('Contrat auto sauvegardé:', savedContratAuto.num);
  
    // 6. Gestion des garanties
    if (dtoC.garanties && dtoC.garanties.length > 0) {
      console.log('Traitement des garanties - nombre:', dtoC.garanties.length);
      const garanties = dtoC.garanties.map((g) => {
        console.log('Création garantie:', g.type);
        return this.garantiesRepository.create({
          ...g,
          contratAuto: savedContratAuto,
        });
      });
      await this.garantiesRepository.save(garanties);
      console.log('Garanties sauvegardées');
    } else {
      console.log('Aucune garantie à traiter');
    }
  
    console.log('=== FIN createCA - Succès ===');
   
    return await this.contratAutoRepository.findOne({
      where: { num: savedContratAuto.num },
      relations: {
        assure: {
          user: {
            adresse: true, // Garde l'adresse de l'utilisateur
          },
        },
        vehicule: true, // Charge seulement les infos de base du véhicule
        garanties: true, // Garde les garanties
      },
    });
  
  }
  // async deleteCA(id: number): Promise<void> {
  //   await this.contratAutoRepository.delete(id);
  // }

  async getAllContratAuto(): Promise<ContratAuto[]> {
    return await this.contratAutoRepository.find({
      relations: ['assure', 'assure.user', 'vehicule', 'garanties'],
    });
  }

  async getContratByCINAndImmatriculation(Cin: number, Imat: string): Promise<ContratAuto[]> {
    return this.contratAutoRepository.find({
      where: {
        assure: { user: { Cin } },
        vehicule: { Imat },
      },
      relations: ['assure', 'assure.user', 'vehicule', 'garanties'],
    });
  }
  async creerNouveauContrat(cinAssure: number, matriculeVehicule: string, packChoice: 'same' | 'Pack1' | 'Pack2' | 'Pack3'): Promise<{ contrat: ContratAuto | null, message?: string }> {
    // 1. Trouver l'assuré et le véhicule
    const assure = await this.assureRepository.findOne({ 
      where: { user: { Cin: cinAssure } },
      relations: ['user', 'user.adresse']
    });
    
    if (!assure) {
      throw new Error('Assuré non trouvé');
    }
  
    const vehicule = await this.vehiculeRepository.findOne({ 
      where: { Imat: matriculeVehicule }
    });
  
    if (!vehicule) {
      throw new Error('Véhicule non trouvé');
    }
  
    // 2. Récupérer tous les contrats liés à cet assuré et ce véhicule
    const contrats = await this.contratAutoRepository.find({
      where: {
        assure: { NumSouscription: assure.NumSouscription },
        vehicule: { id: vehicule.id }
      },
      order: { dateSouscription: 'DESC' },
      relations: {
        garanties: true,
        assure: {
          user: {
            adresse: true
          }
        },
        vehicule: true
      }
    });
  
    if (contrats.length === 0) {
      throw new Error('Aucun contrat existant trouvé');
    }
  
    // 3. Prendre le dernier contrat
    const dernierContrat = contrats[0];
    
    // 4. Calculer l'âge du véhicule à partir de DPMC
    const ageVehicule = this.calculateVehicleAge(vehicule.DPMC);
    
    // 5. Déterminer le pack à utiliser
    let packChoisi = dernierContrat.packChoisi;
    let message: string | undefined = undefined;
    
    if (packChoice === 'same') {
      // Vérification de compatibilité avec l'âge du véhicule
      if (dernierContrat.packChoisi === 'Pack3' && ageVehicule > 3) {
        // Pack Tierce nécessite un véhicule de 3 ans ou moins
        message = 'Le Pack Tierce (Pack3) nécessite un véhicule de 3 ans ou moins. Veuillez choisir un autre pack.';
        return { contrat: null, message };
      } else if (dernierContrat.packChoisi === 'Pack2' && ageVehicule >= 15) {
        // Pack Dommage et Collision nécessite un véhicule de 15 ans ou moins
        message = 'Le Pack Dommage et Collision (Pack2) nécessite un véhicule de 15 ans ou moins. Veuillez choisir un autre pack.';
        return { contrat: null, message };
      }
    } else {
      // Utiliser le pack spécifié par l'utilisateur
      packChoisi = packChoice;
      
      // Vérification de compatibilité avec l'âge du véhicule pour le nouveau pack
      if (packChoice === 'Pack3' && ageVehicule > 3) {
        message = 'Le Pack Tierce (Pack3) nécessite un véhicule de 3 ans ou moins. Veuillez choisir un autre pack.';
        return { contrat: null, message };
      } else if (packChoice === 'Pack2' && ageVehicule >= 15) {
        message = 'Le Pack Dommage et Collision (Pack2) nécessite un véhicule de 15 ans ou moins. Veuillez choisir un autre pack.';
        return { contrat: null, message };
      }
    }
  
    // 6. Créer un nouveau contrat basé sur l'ancien
    const nouveauContrat = this.contratAutoRepository.create({
      ...dernierContrat,
      num: undefined, // Laisser TypeORM générer un nouvel ID
      dateSouscription: new Date(), // Date d'aujourd'hui
      dateExpiration: this.calculerDateExpiration(), // Date d'aujourd'hui + 1 an
      echeances: this.calculerProchaineEcheance(dernierContrat.typePaiement),
      packChoisi: packChoisi, // Utiliser le pack déterminé
      garanties: [],
      assure: assure,
      vehicule: vehicule
    });
  
    // 7. Sauvegarder le nouveau contrat
    const savedContratAuto = await this.contratAutoRepository.save(nouveauContrat);
  
    // 8. Créer les garanties appropriées pour le nouveau pack
    if (packChoice !== 'same' || (packChoice === 'same' && dernierContrat.garanties.length === 0)) {
      // Calculer les nouvelles garanties si le pack a changé ou si l'ancien contrat n'en avait pas
      const garanties = await this.createGarantiesForPack(packChoisi, vehicule, assure.bonusMalus, savedContratAuto);
      await this.garantiesRepository.save(garanties);
    } else {
      // Copier les garanties de l'ancien contrat
      const nouvellesGaranties = dernierContrat.garanties.map(garantie => 
        this.garantiesRepository.create({
          ...garantie,
          id: undefined, // Nouvel ID
          contratAuto: savedContratAuto
        })
      );
      
      await this.garantiesRepository.save(nouvellesGaranties);
    }
  
    // 9. Retourner le contrat avec les relations spécifiées
    const contratFinal = await this.contratAutoRepository.findOne({
      where: { num: savedContratAuto.num },
      relations: {
        assure: {
          user: {
            adresse: true,
          },
        },
        vehicule: true,
        garanties: true,
      },
    });
  
    return { contrat: contratFinal };
  }
  
  private calculateVehicleAge(dpmc: Date | string | null): number {
    if (!dpmc) return 0;
    
    const dpmcDate = new Date(dpmc);
    const today = new Date();
    const ageInYears = today.getFullYear() - dpmcDate.getFullYear();
    
    // Vérifier si l'anniversaire de la date d'immatriculation est déjà passé cette année
    const monthDiff = today.getMonth() - dpmcDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dpmcDate.getDate())) {
      return ageInYears - 1;
    }
    
    return ageInYears;
  }
  
  private async createGarantiesForPack(packChoisi: string, vehicule: Vehicule, bonusMalus: number, contratAuto: ContratAuto): Promise<Garanties[]> {
    const garanties: Garanties[] = [];
    const valeurNeuf = vehicule.valeurNeuf;
    const puissance = vehicule.puissance;
    const responsabiliteCivile = this.calculateResponsabiliteCivile(vehicule.type, bonusMalus, puissance);

    if (packChoisi === 'Pack1') {
        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.ResponsabiliteCivile,
            cotisationNette: responsabiliteCivile,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.RTI,
            cotisationNette: 0.000,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.DefenseEtRecours,
            capital: 1000.000,
            cotisationNette: 50.000,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.Incendie,
            capital: valeurNeuf,
            cotisationNette: this.roundToThreeDecimals(valeurNeuf / 220.115),
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.Vol,
            capital: valeurNeuf,
            cotisationNette: this.roundToThreeDecimals(valeurNeuf / 336.446),
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.PersonneTransportees,
            capital: 5000.000,
            cotisationNette: 50.000,
            contratAuto
        }));

        const brisGlacesCapital = this.roundToThreeDecimals(valeurNeuf <= 30000 ? 500.000 : 600.000);
        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.BrisDeGlaces,
            capital: brisGlacesCapital,
            cotisationNette: this.roundToThreeDecimals(brisGlacesCapital * 0.075),
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.AssistanceAutomobile,
            cotisationNette: 71.500,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.IndividuelAccidentConducteur,
            capital: 20000.000,
            cotisationNette: 25.000,
            contratAuto
        }));

    } else if (packChoisi === 'Pack2') {
        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.ResponsabiliteCivile,
            cotisationNette: responsabiliteCivile,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.RTI,
            cotisationNette: 0.000,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.DefenseEtRecours,
            capital: 1000.000,
            cotisationNette: 50.000,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.Incendie,
            capital: valeurNeuf,
            cotisationNette: this.roundToThreeDecimals(valeurNeuf / 220.115),
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.Vol,
            capital: valeurNeuf,
            cotisationNette: this.roundToThreeDecimals(valeurNeuf / 336.446),
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.PersonneTransportees,
            capital: 5000.000,
            cotisationNette: 50.000,
            contratAuto
        }));

        const brisGlacesCapital = this.roundToThreeDecimals(valeurNeuf <= 30000 ? 500.000 : 600.000);
        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.BrisDeGlaces,
            capital: brisGlacesCapital,
            cotisationNette: this.roundToThreeDecimals(brisGlacesCapital * 0.075),
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.AssistanceAutomobile,
            cotisationNette: 71.500,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.IndividuelAccidentConducteur,
            capital: 20000.000,
            cotisationNette: 25.000,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.EVENEMENTCLIMATIQUE,
            cotisationNette: 25.000,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE,
            cotisationNette: 25.000,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.DOMMAGEETCOLLIDION,
            capital: valeurNeuf,
            cotisationNette: this.roundToThreeDecimals(valeurNeuf * 0.05),
            contratAuto
        }));

    } else if (packChoisi === 'Pack3') {
        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.RTI,
            cotisationNette: 0.000,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.DefenseEtRecours,
            capital: 1000.000,
            cotisationNette: 50.000,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.Incendie,
            capital: valeurNeuf,
            cotisationNette: this.roundToThreeDecimals(valeurNeuf / 220.115),
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.Vol,
            capital: valeurNeuf,
            cotisationNette: this.roundToThreeDecimals(valeurNeuf / 336.446),
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.PersonneTransportees,
            capital: 5000.000,
            cotisationNette: 50.000,
            contratAuto
        }));

        const brisGlacesCapital = this.roundToThreeDecimals(valeurNeuf <= 30000 ? 500.000 : 600.000);
        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.BrisDeGlaces,
            capital: brisGlacesCapital,
            cotisationNette: this.roundToThreeDecimals(brisGlacesCapital * 0.075),
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.AssistanceAutomobile,
            cotisationNette: 71.500,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.IndividuelAccidentConducteur,
            capital: 20000.000,
            cotisationNette: 25.000,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.EVENEMENTCLIMATIQUE,
            cotisationNette: 25.000,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE,
            cotisationNette: 25.000,
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.Tierce,
            capital: valeurNeuf,
            franchise: 0.200,
            cotisationNette: this.roundToThreeDecimals(valeurNeuf * 0.02),
            contratAuto
        }));

        garanties.push(this.garantiesRepository.create({
            type: TypeGaranties.ResponsabiliteCivile,
            cotisationNette: responsabiliteCivile,
            contratAuto
        }));
    }

    return garanties;
}

  private calculateResponsabiliteCivile(type: string, bonusMalus: number, puissance: number): number {
    let cotisation = 0;
    if (type === 'Tourisme') {
      switch (bonusMalus) {
        case 11:
          if (puissance === 4) cotisation = 385;
          else if (puissance === 5) cotisation = 490;
          else if (puissance === 6) cotisation = 490;
          else if (puissance === 7) cotisation = 595;
          break;
        case 10:
          if (puissance === 4) cotisation = 330;
          else if (puissance === 5) cotisation = 420;
          else if (puissance === 6) cotisation = 420;
          else if (puissance === 7) cotisation = 510;
          break;
        case 9:
          if (puissance === 4) cotisation = 275;
          else if (puissance === 5) cotisation = 350;
          else if (puissance === 6) cotisation = 350;
          else if (puissance === 7) cotisation = 425;
          break;
        case 8:
          if (puissance === 4) cotisation = 220;
          else if (puissance === 5) cotisation = 280;
          else if (puissance === 6) cotisation = 280;
          else if (puissance === 7) cotisation = 340;
          break;
        case 7:
          if (puissance === 4) cotisation = 176;
          else if (puissance === 5) cotisation = 224;
          else if (puissance === 6) cotisation = 224;
          else if (puissance === 7) cotisation = 272;
          break;
        case 6:
          if (puissance === 4) cotisation = 154;
          else if (puissance === 5) cotisation = 196;
          else if (puissance === 6) cotisation = 196;
          else if (puissance === 7) cotisation = 238;
          break;
        case 5:
          if (puissance === 4) cotisation = 132;
          else if (puissance === 5) cotisation = 168;
          else if (puissance === 6) cotisation = 168;
          else if (puissance === 7) cotisation = 204;
          break;
        case 4:
          if (puissance === 4) cotisation = 110;
          else if (puissance === 5) cotisation = 140;
          else if (puissance === 6) cotisation = 140;
          else if (puissance === 7) cotisation = 170;
          break;
        case 3:
          if (puissance === 4) cotisation = 99;
          else if (puissance === 5) cotisation = 126;
          else if (puissance === 6) cotisation = 126;
          else if (puissance === 7) cotisation = 153;
          break;
        case 2:
          if (puissance === 4) cotisation = 88;
          else if (puissance === 5) cotisation = 112;
          else if (puissance === 6) cotisation = 112;
          else if (puissance === 7) cotisation = 136;
          break;
        case 1:
          if (puissance === 4) cotisation = 77;
          else if (puissance === 5) cotisation = 98;
          else if (puissance === 6) cotisation = 98;
          else if (puissance === 7) cotisation = 119;
          break;
        default:
          cotisation = 0;
      }
    } else if (type === 'Utilitaire') {
      switch (bonusMalus) {
        case 7:
          if (puissance >= 5 && puissance <= 6) cotisation = 428;
          else if (puissance >= 7 && puissance <= 9) cotisation = 524;
          else if (puissance >= 11 && puissance <= 12) cotisation = 676;
          break;
        case 6:
          if (puissance >= 5 && puissance <= 6) cotisation = 363.8;
          else if (puissance >= 7 && puissance <= 9) cotisation = 445.4;
          else if (puissance >= 11 && puissance <= 12) cotisation = 574.6;
          break;
        case 5:
          if (puissance >= 5 && puissance <= 6) cotisation = 321;
          else if (puissance >= 7 && puissance <= 9) cotisation = 393;
          else if (puissance >= 11 && puissance <= 12) cotisation = 507;
          break;
        case 4:
          if (puissance >= 5 && puissance <= 6) cotisation = 256.8;
          else if (puissance >= 7 && puissance <= 9) cotisation = 314.4;
          else if (puissance >= 11 && puissance <= 12) cotisation = 405.6;
          break;
        case 3:
          if (puissance >= 5 && puissance <= 6) cotisation = 214;
          else if (puissance >= 7 && puissance <= 9) cotisation = 262;
          else if (puissance >= 11 && puissance <= 12) cotisation = 338;
          break;
        case 2:
          if (puissance >= 5 && puissance <= 6) cotisation = 192.6;
          else if (puissance >= 7 && puissance <= 9) cotisation = 235.8;
          else if (puissance >= 11 && puissance <= 12) cotisation = 304.2;
          break;
        case 1:
          if (puissance >= 5 && puissance <= 6) cotisation = 171.2;
          else if (puissance >= 7 && puissance <= 9) cotisation = 209.6;
          else if (puissance >= 11 && puissance <= 12) cotisation = 270.4;
          break;
        default:
          cotisation = 0;
      }
    }
    return this.roundToThreeDecimals(cotisation);
  }
  private roundToThreeDecimals(value: number): number {
    return Math.round(value * 1000) / 1000;
  }

private calculerDateExpiration(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
}

private calculerProchaineEcheance(typePaiement: string): Date {
    const date = new Date();
    
    switch(typePaiement.toLowerCase()) {
      case 'mensuel':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'trimestriel':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'semestriel':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'annuel':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    
    return date;
}
async updateEcheancesAndGetFullContract(numContrat: number): Promise<any> {
  // 1. Récupérer le contrat avec toutes les relations
  const contrat = await this.contratAutoRepository.findOne({
    where: { num: numContrat },
    relations: [
      'assure',
      'assure.user',
      'assure.user.adresse',
      'vehicule',
      'garanties'
    ]
  });

  if (!contrat) {
    throw new NotFoundException(`Contrat avec le numéro ${numContrat} non trouvé`);
  }

  // 2. Mettre à jour le champ echeances
  contrat.echeances = contrat.dateExpiration;

  // 3. Sauvegarder les modifications en base de données
  await this.contratAutoRepository.save(contrat);

  // 4. Retourner l'objet complet avec les relations
  return this.formatContractResponse(contrat);
}

private formatContractResponse(contrat: ContratAuto): any {
  return {
    contrat: {
      num: contrat.num,
      dateSouscription: contrat.dateSouscription,
      dateExpiration: contrat.dateExpiration,
      echeances: contrat.echeances,
      NatureContrat: contrat.NatureContrat,
      typePaiement: contrat.typePaiement,
      cotisationNette: contrat.cotisationNette,
      cotisationTotale: contrat.cotisationTotale,
      montantEcheance: contrat.montantEcheance,
      packChoisi: contrat.packChoisi
    },
    assure: {
      NumSouscription: contrat.assure.NumSouscription,
      bonusMalus: contrat.assure.bonusMalus,
      user: {
        id: contrat.assure.user.id,
        nom: contrat.assure.user.nom,
        prenom: contrat.assure.user.prenom,
        Cin: contrat.assure.user.Cin,
        telephone: contrat.assure.user.telephone,
        email: contrat.assure.user.email,
        date_naissance: contrat.assure.user.date_naissance,
        adresse: {
          rue: contrat.assure.user.adresse.rue,
          numMaison: contrat.assure.user.adresse.numMaison,
          ville: contrat.assure.user.adresse.ville,
          codePostal: contrat.assure.user.adresse.codePostal,
          pays: contrat.assure.user.adresse.pays
        }
      }
    },
    vehicule: {
      id: contrat.vehicule.id,
      type: contrat.vehicule.type,
      marque: contrat.vehicule.marque,
      model: contrat.vehicule.model,
      Imat: contrat.vehicule.Imat,
      energie: contrat.vehicule.energie,
      nbPlace: contrat.vehicule.nbPlace,
      DPMC: contrat.vehicule.DPMC,
      cylindree: contrat.vehicule.cylindree,
      chargeUtil: contrat.vehicule.chargeUtil,
      valeurNeuf: contrat.vehicule.valeurNeuf,
      numChassis: contrat.vehicule.numChassis,
      poidsVide: contrat.vehicule.poidsVide,
      puissance: contrat.vehicule.puissance
    },
    garanties: contrat.garanties.map(g => ({
      id: g.id,
      type: g.type,
      capital: g.capital|| 0,
      cotisationNette: g.cotisationNette,
      franchise: g.franchise
    }))
  };
}
async getContratsByUserCin(Cin: number): Promise<any[]> {
  console.log(`Recherche des contrats pour l'utilisateur avec CIN: ${Cin}`);
  
  if (!Cin) {
    throw new Error('Le CIN est obligatoire');
  }

  const contrats = await this.contratAutoRepository.find({
    where: {
      assure: {
        user: {
          Cin: Cin
        }
      }
    },
    relations: [
      'assure',
      'assure.user',
      'vehicule' // Seulement la relation vehicule est nécessaire pour les champs demandés
    ],
    order: {
      dateSouscription: 'DESC'
    }
  });

  if (contrats.length === 0) {
    return [];
  }

  console.log(`Nombre de contrats trouvés: ${contrats.length}`);

  // Formatage spécifique pour ne retourner que les champs demandés
  return contrats.map(contrat => ({
    num: contrat.num,  
    dateSouscription: contrat.dateSouscription,
    dateExpiration: contrat.dateExpiration,
    vehicule: {
      marque: contrat.vehicule.marque,
      model: contrat.vehicule.model,
      Imat: contrat.vehicule.Imat
    }
  }));
}

async getContratDetailsByNum(numContrat: number): Promise<FullContratResponse> {
  console.log(`Recherche du contrat numéro: ${numContrat}`);

  const contrat = await this.contratAutoRepository.findOne({
    where: { num: numContrat },
    relations: [
      'assure',
      'assure.user',
      'assure.user.adresse',
      'vehicule', 
      'garanties'
    ]
  });

  if (!contrat) {
    throw new NotFoundException(`Contrat ${numContrat} non trouvé`);
  }

  return {
    contrat: {
      num: contrat.num,
      dateSouscription: contrat.dateSouscription,
      dateExpiration: contrat.dateExpiration,
      echeances: contrat.echeances,
      NatureContrat: contrat.NatureContrat || 'Standard',
      typePaiement: contrat.typePaiement || 'Non spécifié',
      cotisationNette: contrat.cotisationNette || 0,
      cotisationTotale: contrat.cotisationTotale || 0,
      montantEcheance: contrat.montantEcheance || 0,
      packChoisi: contrat.packChoisi || 'Non spécifié'
    },
    assure: {
      NumSouscription: contrat.assure.NumSouscription || 0,
      bonusMalus: contrat.assure.bonusMalus || 0,
      user: {
        id: contrat.assure.user.id || 0,
        nom: contrat.assure.user.nom || 'Non spécifié',
        prenom: contrat.assure.user.prenom || 'Non spécifié',
        Cin: contrat.assure.user.Cin ,
        telephone: contrat.assure.user.telephone || 'Non spécifié',
        email: contrat.assure.user.email || 'Non spécifié',
        date_naissance: contrat.assure.user.date_naissance || null,
        adresse: contrat.assure.user.adresse ? {
            rue: contrat.assure.user.adresse.rue || 'Non spécifié',
            numMaison: contrat.assure.user.adresse.numMaison ?? null,  // number ou null
            ville: contrat.assure.user.adresse.ville || 'Non spécifié',
            gouvernat: contrat.assure.user.adresse.gouvernat || 'Non spécifié', // ajouté ce champ !
            codePostal: contrat.assure.user.adresse.codePostal ?? 0,  // number obligatoire, si vide = 0 par défaut
            pays: contrat.assure.user.adresse.pays || 'Non spécifié'
          } : null
          
      }
    },
    vehicule: {
      id: contrat.vehicule?.id || 0,
      type: contrat.vehicule?.type || 'Non spécifié',
      marque: contrat.vehicule?.marque || 'Non spécifié',
      model: contrat.vehicule?.model || 'Non spécifié',
      Imat: contrat.vehicule?.Imat || 'Non spécifié',
      energie: contrat.vehicule?.energie || 'Non spécifié',
      nbPlace: contrat.vehicule?.nbPlace || 0,
      DPMC: contrat.vehicule?.DPMC || null,
      cylindree: contrat.vehicule?.cylindree || 'Non spécifié',
      chargeUtil: contrat.vehicule?.chargeUtil || 0,
      valeurNeuf: contrat.vehicule?.valeurNeuf || 0,
      numChassis: contrat.vehicule?.numChassis || 'Non spécifié',
      poidsVide: contrat.vehicule?.poidsVide || 0,
      puissance: contrat.vehicule?.puissance || 0
    },
    garanties: (contrat.garanties || []).map(g => ({
      id: g.id || 0,
      type: g.type || 'Non spécifié',
      capital: g.capital || 0,
      cotisationNette: g.cotisationNette || 0,
      franchise: g.franchise || 0
    }))
  };
}
async getAllAssures(): Promise<Array<{
  NumSouscription: number;
  nom: string;
  prenom: string;
  Cin: string;
  bonusMalus: number;
  telephone: string;
}>> {
  console.log('Récupération de tous les assurés');
  
  // Récupération de tous les assurés avec les relations nécessaires
  const assures = await this.assureRepository.find({
    relations: ['user']
  });

  console.log(`Nombre d'assurés trouvés: ${assures.length}`);

  // Formatage du résultat pour ne retourner que les champs demandés
  return assures.map(assure => ({
    NumSouscription: assure.NumSouscription,
    nom: assure.user.nom || 'Non spécifié',
    prenom: assure.user.prenom || 'Non spécifié',
    Cin: String(assure.user.Cin) ,
    bonusMalus: assure.bonusMalus || 0,
    telephone: assure.user.telephone || 'Non spécifié'
  }));
}
async updateContratStatus(numContrat: number, nouveauStatus: 'valide' | 'invalide'): Promise<ContratAuto | null> {
  console.log(`Mise à jour du statut du contrat ${numContrat} vers ${nouveauStatus}`);
  
  // 1. Récupérer le contrat existant
  const contrat = await this.contratAutoRepository.findOne({
    where: { num: numContrat },
    relations: [
      'assure',
      'assure.user',
      'assure.user.adresse',
      'vehicule',
      'garanties'
    ]
  });

  if (!contrat) {
    throw new NotFoundException(`Contrat avec le numéro ${numContrat} non trouvé`);
  }

  // 2. Mettre à jour le statut
  contrat.etat = nouveauStatus;

  // 3. Sauvegarder les modifications
  const updatedContrat = await this.contratAutoRepository.save(contrat);
  console.log(`Statut du contrat ${numContrat} mis à jour avec succès vers ${nouveauStatus}`);

  // 4. Retourner le contrat mis à jour avec toutes ses relations
  return updatedContrat;
}
}
