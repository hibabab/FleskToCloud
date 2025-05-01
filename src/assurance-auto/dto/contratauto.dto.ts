import { IsDateString, IsEnum, IsPositive, IsInt, IsOptional, IsArray } from 'class-validator';
import { CreateGarantiesDto } from './garanties.dto';

export class ContratAutoDto {
 
  @IsPositive()
  cotisationNette: number;

  
  packChoisi: string;

  @IsPositive()
  cotisationTotale: number;

  
  etat?: 'valide' | 'invalide';

  @IsArray()
  garanties?: CreateGarantiesDto[];
}
