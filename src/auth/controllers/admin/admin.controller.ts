import {
    Controller,
    Post,
    Body,
    Patch,
    Param,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
   
  } from '@nestjs/common';
import { CreateAdminDto } from 'src/auth/dto/create-admin.dto';


import { UpdateAdminDto } from 'src/auth/dto/update-admin.dto';
import { AdminService } from 'src/auth/services/admin/admin.service';
 
  
  
@Controller('admin-gateway')
  export class AdminController {
    constructor(private readonly adminService: AdminService) {}
  
    /**
     * Crée un nouvel administrateur
     * @param createAdminDto Les données pour créer un administrateur
     * @returns L'administrateur créé
     */
    @Post('ajoutAdmin')
    
    async create(@Body() createAdminDto: CreateAdminDto) {
      try {
        return await this.adminService.createAdmin(createAdminDto);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(error.message);
        }
        throw new InternalServerErrorException('Échec de la création de l\'administrateur');
      }
    }
  
    /**
     * Met à jour un administrateur existant
     * @param id L'ID de l'administrateur à mettre à jour
     * @param updateAdminDto Les données de mise à jour
     * @returns L'administrateur mis à jour
     */
    @Patch(':id')

    async update(
      @Param('id') id: number,
      @Body() updateAdminDto: UpdateAdminDto,
    ) {
      try {
        return await this.adminService.updateAdmin(id, updateAdminDto);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new BadRequestException(error.message);
        }
        throw new InternalServerErrorException('Échec de la mise à jour de l\'administrateur');
      }
    }
    @Post('verify')
    async verifyAdmin(@Body() body: { email: string; motDePasse: string }) {
        try {
          const { email, motDePasse } = body;
          if (!email || !motDePasse) {
            throw new BadRequestException('Email et mot de passe requis');
          }
      
          const isAdmin = await this.adminService.isAdmin(email, motDePasse);
          if (!isAdmin) {
            throw new BadRequestException('Identifiants administrateur invalides');
          }
      
          return { 
            success: true, 
            message: 'Authentification administrateur réussie' 
          };
        } catch (error) {
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new InternalServerErrorException('Échec de la vérification des identifiants');
        }
      }}