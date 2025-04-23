// src/expert-gateway/dto/update-expert.dto.ts
import { IsBoolean, IsNumber, IsString, IsDate, IsOptional } from 'class-validator';

export class UpdateExpertDto {
  @IsOptional()
  @IsBoolean()
  disponibilite?: boolean;

  @IsOptional()
  @IsNumber()
  nbAnneeExperience?: number;

  @IsOptional()
  @IsString()
  specialite?: string;

  @IsOptional()
  @IsDate()
  dateInscri?: Date;
}