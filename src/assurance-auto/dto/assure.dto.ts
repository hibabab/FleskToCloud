import { IsPositive } from "class-validator";


export class AssureDto {
  
  @IsPositive()
  bonusMalus: number;
}
