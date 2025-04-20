import {
  Controller,
  Body,
  Post,
  Get,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/SignupDto';
import { LoginDto } from './dto/loginDto';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto.dto';
import { ResetPasswordDto } from './dto/Restpassworld.dto';
import { AuthenticationGuard } from '../guards/auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

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
  login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
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
}
