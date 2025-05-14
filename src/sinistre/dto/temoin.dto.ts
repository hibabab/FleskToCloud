import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { AdresseDto } from 'src/auth/dto/adresse.dto';

export class TemoinDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @ValidateNested()
  @Type(() => AdresseDto)
  @IsNotEmpty()
  adresse: AdresseDto;
  @IsString()
  @IsNotEmpty()
  telephone: string;
}
