import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
import { updateUserDto } from 'src/auth/dto/updateUser.dto';
import { Adresse } from 'src/auth/entities/adresse.entity';
import { User } from 'src/auth/entities/user.entity';
  import { Repository } from 'typeorm';
  
  
  @Injectable()
  export class UserService {
    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
  
      @InjectRepository(Adresse)
      private readonly adresseRepository: Repository<Adresse>,
  
     // private readonly adresseService: AdresseService,
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
        throw new NotFoundException(`Utilisateur avec l'email ${email} non trouvé`);
      }
    
      return user;
    }
    // async updateUser(data: {
    //   id: number;
    //   updateUserDto: updateUserDto;
    // }): Promise<User> {
    //   const { id, updateUserDto } = data; // 🔹 Extraction des données
  
    //   console.log('🔹 Données reçues pour la mise à jour :', updateUserDto);
  
    //   if (!updateUserDto) {
    //     throw new BadRequestException('Aucune donnée de mise à jour reçue');
    //   }
  
    //   console.log("🔍 Recherche de l'utilisateur avec id:", id);
    //   const user = await this.userRepository.findOne({
    //     where: { id },
    //     relations: ['adresse'], // Vérifie que l'adresse est bien incluse
    //   });
  
    //   if (!user) {
    //     console.log(`❌ Utilisateur avec l'id ${id} non trouvé`);
    //     throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé`);
    //   }
    //   console.log('✅ Utilisateur trouvé:', user);
  
    //   // Mise à jour des informations de l'utilisateur
    //   console.log("🛠️ Mise à jour des données de l'utilisateur");
    //   Object.assign(user, updateUserDto);
  
    //   if (updateUserDto.adresse) {
    //     console.log("🔄 Mise à jour de l'adresse...");
    //     try {
    //       const updatedAdresse = await this.adresseService.findOrCreate(
    //         updateUserDto.adresse,
    //       );
    //       user.adresse = updatedAdresse;
    //       console.log('✅ Adresse mise à jour:', updatedAdresse);
    //     } catch (error) {
    //       console.log("❌ Erreur lors de la mise à jour de l'adresse:", error);
    //       throw new InternalServerErrorException(
    //         "Erreur lors de la mise à jour de l'adresse",
    //       );
    //     }
    //   }
  
    //   // Vérification avant de sauvegarder
    //   console.log('🔎 Vérification des données avant sauvegarde :', user);
  
    //   try {
    //     console.log("💾 Sauvegarde de l'utilisateur...");
    //     const savedUser = await this.userRepository.save(user);
    //     console.log('✅ Utilisateur mis à jour:', savedUser);
    //     return savedUser;
    //   } catch (error) {
    //     console.log("❌ Erreur lors de la sauvegarde de l'utilisateur:", error);
    //     throw new InternalServerErrorException(
    //       "Erreur interne lors de la sauvegarde de l'utilisateur",
    //     );
    //   }
    // }
  
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
    
  }
  