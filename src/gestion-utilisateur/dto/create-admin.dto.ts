import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsPhoneNumber, Matches } from 'class-validator';

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8) 
  @MaxLength(255)
  motDePasse: string;

  @IsString()
  @MaxLength(50)
  role: string;
}
export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/, {
    message: 'Le mot de passe doit contenir au moins 1 majuscule, 1 minuscule et 1 chiffre',
  })
  newPassword: string;
}