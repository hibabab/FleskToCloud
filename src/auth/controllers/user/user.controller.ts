import {
    Controller,
    Get,
    Param,
    Body,
    BadRequestException,
    Put,
    NotFoundException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { User } from 'src/auth/entities/user.entity';
  import { UserService } from 'src/auth/services/user/user.service';
  
  @Controller('user-gateway')
  export class UserGatewayController {
    constructor(private readonly userService: UserService) {}
  
    @Get('users')
    async getUsers(): Promise<User[]> {
      try {
        return await this.userService.getAllUsers();
      } catch (error) {
        throw new InternalServerErrorException('Erreur lors de la récupération des utilisateurs');
      }
    }
    @Get('search/:cinOrEmail')
    async searchUser(@Param('cinOrEmail') cinOrEmail: string) {
      try {
        // Essayez d'abord de convertir en number pour le CIN
        const cinNumber = Number(cinOrEmail);
        const isCinSearch = !isNaN(cinNumber);
        
        let user: User;
        
        if (isCinSearch) {
          // Recherche par CIN (number)
          user = await this.userService.getUserByCin(cinNumber);
        } else {
          // Recherche par email (string)
          user = await this.userService.getUserByEmail(cinOrEmail);
        }
        
        return [user]; // Retourne toujours un tableau
      } catch (error) {
        if (error instanceof NotFoundException) {
          return []; // Retourne un tableau vide si non trouvé
        }
        throw error;
      }
    }
    @Get('profile/:id')
    async getUserProfile(@Param('id') id: string): Promise<User> {
      if (!id || isNaN(+id)) {
        throw new BadRequestException("L'ID fourni n'est pas valide");
      }
      
      try {
        return await this.userService.getUserById(+id);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Erreur lors de la récupération du profil utilisateur');
      }
    }
  
    @Put(':id/block')
    async blockUser(
      @Param('id') id: string,
      @Body('isBlocked') isBlocked: boolean,
    ): Promise<User> {
      if (!id || isNaN(+id)) {
        throw new BadRequestException("L'ID fourni n'est pas valide");
      }
  
      try {
        return await this.userService.blockUser(+id, isBlocked);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException("Erreur lors du blocage/déblocage de l'utilisateur");
      }
    }
  
    @Get('users/count')
    async countUsers(): Promise<number> {
      try {
        return await this.userService.countUsers();
      } catch (error) {
        throw new InternalServerErrorException('Erreur lors du comptage des utilisateurs');
      }
    }
  
    @Get('users/role/:role')
    async getUsersByRole(@Param('role') role: string): Promise<User[]> {
      try {
        return await this.userService.getAllUsersByRole(role);
      } catch (error) {
        throw new InternalServerErrorException('Erreur lors de la récupération des utilisateurs par rôle');
      }
    }
  }