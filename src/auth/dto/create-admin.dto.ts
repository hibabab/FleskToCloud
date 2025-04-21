import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsPhoneNumber } from 'class-validator';

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