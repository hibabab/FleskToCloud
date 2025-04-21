import { IsString, IsInt, IsDate, IsOptional } from 'class-validator';

export class CreateControleTechniqueDto {
  @IsString()
  numero: string;

  @IsDate()
  dateLivrance: Date;

  @IsDate()
  dateExpiration: Date;

  @IsString()
  Imat: string;

  @IsString()
  centreControle: string;

  @IsString()
  refInterne: string;

  @IsString()
  statutControle: string;

  @IsInt()
  vehiculeId: number;
}

export class UpdateControleTechniqueDto {
  @IsOptional() @IsString()
  numero?: string;

  @IsOptional() @IsDate()
  dateLivrance?: Date;

  @IsOptional() @IsDate()
  dateExpiration?: Date;

  @IsOptional() @IsString()
  Imat?: string;

  @IsOptional() @IsString()
  centreControle?: string;

  @IsOptional() @IsString()
  refInterne?: string;

  @IsOptional() @IsString()
  statutControle?: string;

  @IsOptional() @IsInt()
  vehiculeId?: number;
}
