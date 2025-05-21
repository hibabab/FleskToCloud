import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { updateUserDto } from 'src/auth/dto/updateUser.dto';
import { Adresse } from 'src/auth/entities/adresse.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Adresse)
    private readonly adresseRepository: Repository<Adresse>,
  ) {}

  // Récupère tous les utilisateurs avec leur adresse
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({ relations: ['adresse'] });
  }

  // Récupère un utilisateur par son ID avec son adresse
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['adresse'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé`);
    }

    return user;
  }

  async getUserByCin(cin: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { Cin: cin },
      relations: ['adresse'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec le CIN ${cin} non trouvé`);
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['adresse'],
    });

    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec l'email ${email} non trouvé`,
      );
    }

    return user;
  }

  async blockUser(id: number, isBlocked: boolean): Promise<User> {
    console.log(
      `🔹 Tentative de blocage/déblocage de l'utilisateur avec id: ${id}`,
    );

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé`);
    }

    user.isBlocked = isBlocked;

    try {
      console.log('💾 Sauvegarde du statut de blocage...');
      const savedUser = await this.userRepository.save(user);
      console.log('✅ Utilisateur mis à jour:', savedUser);
      return savedUser;
    } catch (error) {
      console.log("❌ Erreur lors de la sauvegarde de l'utilisateur:", error);
      throw new InternalServerErrorException(
        "Erreur interne lors de la sauvegarde de l'utilisateur",
      );
    }
  }

  async countUsers(): Promise<number> {
    try {
      return await this.userRepository.count();
    } catch (error) {
      console.error('❌ Erreur lors du comptage des utilisateurs:', error);
      throw new InternalServerErrorException(
        'Erreur interne lors du comptage des utilisateurs',
      );
    }
  }

  async getAllUsersByRole(role: string): Promise<User[]> {
    return this.userRepository.find({
      where: { role },
    });
  }
  async updateUser(data: {
    id: number;
    updateUserDto: updateUserDto;
  }): Promise<User> {
    const { id, updateUserDto } = data;
  
    console.log('🔹 Données reçues pour la mise à jour :', JSON.stringify(updateUserDto, null, 2));
  
    if (!updateUserDto) {
      throw new BadRequestException('Aucune donnée de mise à jour reçue');
    }
  
    console.log("🔍 Recherche de l'utilisateur avec id:", id);
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['adresse'],
    });
  
    if (!user) {
      console.log(`❌ Utilisateur avec l'id ${id} non trouvé`);
      throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé`);
    }
  
    console.log('✅ Utilisateur trouvé avec adresse:', JSON.stringify(user.adresse, null, 2));
  
    // Mise à jour des données utilisateur simples
    user.telephone = updateUserDto.telephone;
    user.email = updateUserDto.email;
  
    // Traitement spécifique de l'adresse
    if (updateUserDto.adresse) {
      console.log('🔄 Données d\'adresse reçues:', JSON.stringify(updateUserDto.adresse, null, 2));
      
      try {
        // SOLUTION 1: Mise à jour directe de l'adresse existante
        if (user.adresse) {
          console.log('📝 Mise à jour directe de l\'adresse existante id:', user.adresse.id);
          
          // Mise à jour explicite de chaque champ
          user.adresse.rue = updateUserDto.adresse.rue;
          user.adresse.ville = updateUserDto.adresse.ville;
          user.adresse.codePostal = updateUserDto.adresse.codePostal;
          user.adresse.pays = updateUserDto.adresse.pays;
          
          // Explicitement mettre à jour gouvernat et numMaison
          if (updateUserDto.adresse.gouvernat !== undefined) {
            console.log('📌 Mise à jour de gouvernat:', updateUserDto.adresse.gouvernat);
            user.adresse.gouvernat = updateUserDto.adresse.gouvernat;
          }
          
          if (updateUserDto.adresse.numMaison !== undefined) {
            console.log('📌 Mise à jour de numMaison:', updateUserDto.adresse.numMaison);
            user.adresse.numMaison = updateUserDto.adresse.numMaison;
          }
          
          // Sauvegarder l'adresse d'abord
          await this.adresseRepository.save(user.adresse);
          console.log('✅ Adresse mise à jour:', JSON.stringify(user.adresse, null, 2));
        } else {
          // Créer une nouvelle adresse
          console.log('🆕 Création d\'une nouvelle adresse');
          const newAddress = this.adresseRepository.create({
            rue: updateUserDto.adresse.rue,
            ville: updateUserDto.adresse.ville,
            codePostal: updateUserDto.adresse.codePostal,
            gouvernat: updateUserDto.adresse.gouvernat,
            numMaison: updateUserDto.adresse.numMaison,
            pays: updateUserDto.adresse.pays || 'Tunisie'
          });
          
          const savedAddress = await this.adresseRepository.save(newAddress);
          user.adresse = savedAddress;
          console.log('✅ Nouvelle adresse créée:', JSON.stringify(savedAddress, null, 2));
        }
      } catch (error) {
        console.log('❌ Erreur détaillée lors de la mise à jour de l\'adresse:', error);
        throw new InternalServerErrorException(
          `Erreur lors de la mise à jour de l'adresse: ${error.message}`
        );
      }
    }
  
    try {
      console.log("💾 Sauvegarde de l'utilisateur avec adresse mise à jour:", 
        JSON.stringify({...user, adresse: user.adresse}, null, 2));
      
      const savedUser = await this.userRepository.save(user);
      console.log('✅ Utilisateur mis à jour avec succès:', 
        JSON.stringify({...savedUser, adresse: savedUser.adresse}, null, 2));
      
      return savedUser;
    } catch (error) {
      console.log("❌ Erreur détaillée lors de la sauvegarde de l'utilisateur:", error);
      throw new InternalServerErrorException(
        `Erreur interne lors de la sauvegarde de l'utilisateur: ${error.message}`
      );
    }
  }
}
