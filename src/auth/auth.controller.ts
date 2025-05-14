import {
  Controller,
  Body,
  Post,
  Get,
  Param,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/SignupDto';
import { LoginDto } from './dto/loginDto';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto.dto';
import { ResetPasswordDto } from './dto/Restpassworld.dto';
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
      throw error;
    }
  }

  // Endpoints de gestion de mot de passe
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.newPassword,
      resetPasswordDto.resetToken,
    );
  }

  @Post(':userId/change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('userId') userId: number,
  ) {
    return this.authService.changePassword(
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
      userId,
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
        'Erreur lors de la récupération des utilisateurs',
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


  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  /*const refreshToken = req.cookies.refresh_token;
  const tokens = await this.authService.refreshToken(refreshToken);
  
  res.cookie('access_token', tokens.access_token, { 
    httpOnly: true, 
    secure: true,
    sameSite: 'strict', 
    maxAge: 15 * 60 * 1000 // 15 min
  });
  
  res.cookie('refresh_token', tokens.refresh_token, {
    httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    return { message: 'Tokens refreshed' };
 */ }
}
