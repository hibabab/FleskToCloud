import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';

  import * as bcrypt from 'bcrypt';
import { Admin } from 'src/gestion-utilisateur/entities/admin.entity';
import { CreateAdminDto } from 'src/gestion-utilisateur/dto/create-admin.dto';
import { UpdateAdminDto } from 'src/gestion-utilisateur/dto/update-admin.dto';
  
  @Injectable()
  export class AdminService {
    private readonly SALT_ROUNDS = 12;
    private readonly logger = new Logger(AdminService.name); 
  
    constructor(
      @InjectRepository(Admin)
      private readonly adminRepository: Repository<Admin>,
    ) {}
    async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
      try {
        // Hashage du mot de passe avant sauvegarde
        const hashedPassword = await bcrypt.hash(createAdminDto.motDePasse, this.SALT_ROUNDS);
        
        const admin = this.adminRepository.create({
          ...createAdminDto,
          motDePasse: hashedPassword,
        });
        
        const savedAdmin = await this.adminRepository.save(admin);
        this.logger.log('Administrateur créé avec succès');
        return savedAdmin;
      } catch (error) {
        this.logger.error('Erreur lors de la création de l\'administrateur', error.stack);
        throw new InternalServerErrorException('Erreur interne lors de la création de l\'administrateur');
      }
    }
  
    async isAdmin(email: string, motDePasse: string): Promise<boolean> {
      try {
        // Recherche l'admin par email
        const admin = await this.adminRepository.findOne({ where: { email } });
        
        // Si aucun admin trouvé ou email ne correspond pas à l'email admin spécifique
        if (!admin || admin.email !== 'admin.fleskcover@gmail.com') {
          return false;
        }
  
        // Vérifie si le mot de passe correspond (avec bcrypt)
        return await bcrypt.compare(motDePasse, admin.motDePasse);
      } catch (error) {
        this.logger.error('Erreur lors de la vérification des identifiants admin', error.stack);
        throw new InternalServerErrorException(
          'Erreur interne lors de la vérification des identifiants admin',
        );
      }
    }
    async updateAdmin(id: number, updateAdminDto: UpdateAdminDto): Promise<Admin> {
      try {
        // Vérifie si l'administrateur existe
        const admin = await this.adminRepository.findOne({ where: { id } });
        if (!admin) {
          throw new NotFoundException(`Administrateur avec l'ID ${id} non trouvé.`);
        }
  
        // Si le mot de passe est fourni, on le hash
        if (updateAdminDto.motDePasse) {
          updateAdminDto.motDePasse = await bcrypt.hash(updateAdminDto.motDePasse, this.SALT_ROUNDS);
        }
  
        // Met à jour les champs de l'administrateur
        Object.assign(admin, updateAdminDto);
        return await this.adminRepository.save(admin);
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de l\'administrateur:', error);
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException(
          'Erreur interne lors de la mise à jour de l\'administrateur',
        );
      }
    }
    async hashPassword(plainPassword: string): Promise<string> {
      return bcrypt.hash(plainPassword, this.SALT_ROUNDS);
    }
  }