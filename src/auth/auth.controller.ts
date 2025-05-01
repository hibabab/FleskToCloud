import {
  Controller,
  Body,
  Post,
  Get,
  UseGuards,
  Req,
  Param,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/SignupDto';
import { LoginDto } from './dto/loginDto';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto.dto';
import { ResetPasswordDto } from './dto/Restpassworld.dto';
import { AuthenticationGuard } from '../guards/auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Endpoints d'authentification
  @Post('register')
  signUp(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData);
  }

  @Post('register2')
  signUp2(@Body() signupData: SignupDto) {
    return this.authService.signup2(signupData);
  }

  @Post('confirm')
  confirm(@Body() data: { email: string; code: string }) {
    return this.authService.confirmSignup(data.email, data.code);
  }

  @Post('login')
  async login(@Body() credentials: LoginDto) {
      try {
          return await this.authService.login(credentials);
      } catch (error) {
          console.error('Controller login error:', error);
          throw error; // Laissez passer l'erreur originale
      }
  }

  // Endpoints de gestion de mot de passe
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('change-password')
  @UseGuards(AuthenticationGuard)
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req) {
    return this.authService.changePassword(
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.userId,
    );
  }
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.newPassword,
      resetPasswordDto.resetToken,
    );
  }

  // Endpoint pour récupérer le rôle
  @Get('role/:userId')
  async getUserRole(@Param('userId') userId: number) {
    return this.authService.getRole(userId);
  }

  // Endpoint de test
  @Get('ok')
  getOk() {
    return 'OK';
  }
  @Get('users')
async getAllUsers() {
  try {
    return await this.authService.getAllUsers();
  } catch (error) {
    if (error instanceof InternalServerErrorException) {
      throw error;
    }
    throw new InternalServerErrorException(
      'Erreur lors de la récupération des utilisateurs'
    );
  }
}
@Get('users/:id')
async getUserById(@Param('id') id: number): Promise<User> {
  
  if (isNaN(id)) {
    throw new BadRequestException('ID invalide');
  }
  return this.authService.getUserById(id);
}
@Get('user/:Cin')
async getUserByCin(@Param('Cin') Cin: number): Promise<User> {
  
  if (isNaN(Cin)) {
    throw new BadRequestException('ID invalide');
  }
  return this.authService.getUserByCin(Cin);
}

}
