import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsPhoneNumber } from 'class-validator';

export class UpdateAdminDto {
 

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  motDePasse?: string;
}