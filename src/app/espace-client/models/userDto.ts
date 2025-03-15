import { AdresseDto } from "./adresse-dto";

export interface UserDto {
    email: string;               
    password: string;            
    nom: string;                 
    prenom: string;              
    Cin: string;                
    telephone: string;           
    adresse: AdresseDto;         
    date_naissance: Date;        
}
