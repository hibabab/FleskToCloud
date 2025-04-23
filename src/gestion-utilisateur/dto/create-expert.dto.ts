// src/expert-gateway/dto/create-expert.dto.ts
import { IsNumber, IsBoolean, IsString, IsDate, IsDateString } from 'class-validator';

export class CreateExpertDto {
  @IsNumber()
  userId: number;

  @IsBoolean()
  disponibilite: boolean;

  @IsNumber()
  nbAnneeExperience: number;

  @IsString()
  specialite: string;

  @IsString() 
  dateInscri: string;
}