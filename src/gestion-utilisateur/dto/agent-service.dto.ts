import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAgentServiceDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number; // L'ID de l'utilisateur associé à l'agent de service

  @IsString()
  @IsNotEmpty()
  specialite: string; // La spécialité de l'agent de service

  @IsString() 
  @IsNotEmpty()
  dateEmbauche: string; // La date d'embauche de l'agent de service
}

export class UpdateAgentServiceDto {
  @IsString()
  @IsNotEmpty()
  specialite?: string; // La spécialité de l'agent de service (optionnelle pour la mise à jour)

  @IsString() 
  @IsNotEmpty()
  dateEmbauche?: string; // La date d'embauche de l'agent de service (optionnelle pour la mise à jour)
}