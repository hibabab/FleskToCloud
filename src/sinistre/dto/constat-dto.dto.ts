import {
  IsString,
  IsDate,
  IsNotEmpty,
  IsBoolean,
  ValidateNested,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AdresseDto } from 'src/auth/dto/adresse.dto';
import { TemoinDto } from './temoin.dto';
import { ConducteurDto } from './conducteur.dto';

export class ConstatDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dateAccident: Date; // 📌 Date de l'accident

  @IsNotEmpty()
  @IsString()
  heure: string; // 📌 Heure de l'accident au format HH:mm

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AdresseDto)
  lieu: AdresseDto; // 📌 Adresse de l'accident

  @IsBoolean()
  blessees: boolean; // 📌 Y a-t-il des blessés ?

  @IsBoolean()
  degatMateriels: boolean;
  // 📌 Y a-t-il des dégâts matériels ?
  @IsString()
  circonstance: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemoinDto)
  temoins: TemoinDto[];
  @IsOptional()
  @IsString()
  pathurl?: string; // 🚨 Changement de 'fichier' à 'pathurl'
  @IsOptional() // 📌 Conducteur peut être null
  @ValidateNested()
  @Type(() => ConducteurDto)
  conducteur?: ConducteurDto;
  photos?: string[];
}
