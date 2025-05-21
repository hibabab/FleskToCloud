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
import { updateUserDto } from 'src/auth/dto/updateUser.dto';
import { User } from 'src/auth/entities/user.entity';
import { UserService } from 'src/gestion-utilisateur/services/user/user.service';

@Controller('user-gateway')
export class UserGatewayController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  async getUsers(): Promise<User[]> {
    try {
      return await this.userService.getAllUsers();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des utilisateurs',
      );
    }
  }

  @Get('search/:cinOrEmail')
  async searchUser(@Param('cinOrEmail') cinOrEmail: string) {
    try {
      const cinNumber = Number(cinOrEmail);
      const isCinSearch = !isNaN(cinNumber);

      let user: User;

      if (isCinSearch) {
        user = await this.userService.getUserByCin(cinNumber);
      } else {
        user = await this.userService.getUserByEmail(cinOrEmail);
      }

      return [user];
    } catch (error) {
      if (error instanceof NotFoundException) {
        return [];
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
      throw new InternalServerErrorException(
        'Erreur lors de la récupération du profil utilisateur',
      );
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
      throw new InternalServerErrorException(
        "Erreur lors du blocage/déblocage de l'utilisateur",
      );
    }
  }

  @Get('users/count')
  async countUsers(): Promise<number> {
    try {
      return await this.userService.countUsers();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException(
        'Erreur lors du comptage des utilisateurs',
      );
    }
  }

  @Get('users/role/:role')
  async getUsersByRole(@Param('role') role: string): Promise<User[]> {
    try {
      return await this.userService.getAllUsersByRole(role);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des utilisateurs par rôle',
      );
    }
  }
  @Put(':id/update')
  async updateUser(
    @Param('id') id: string, // récupéré sous forme de string
    @Body() updateUserDto: updateUserDto,
  ): Promise<User> {
    const userId = Number(id); // conversion manuelle en nombre
    return this.userService.updateUser({ id: userId, updateUserDto });
  }
}
