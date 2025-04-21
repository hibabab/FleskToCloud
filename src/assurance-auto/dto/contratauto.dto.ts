import { IsDateString, IsEnum, IsPositive, IsInt, IsOptional, IsArray } from 'class-validator';
import { CreateGarantiesDto } from './garanties.dto';

export class ContratAutoDto {
  
  @IsDateString()
  dateSouscription: string;

  @IsDateString()
  dateExpiration: string;

  
  NatureContrat: string;

  
  typePaiement: string; 

  @IsDateString()
  echeances: string;
  
  @IsPositive()
  cotisationNette: number;

  
  packChoisi: string;

  @IsPositive()
  cotisationTotale: number;

  @IsPositive()
  montantEcheance: number; 
  etat?: 'valide' | 'invalide';
  @IsOptional()
  @IsArray()
  garanties?: CreateGarantiesDto[];
}
