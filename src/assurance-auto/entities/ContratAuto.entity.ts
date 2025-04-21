
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Assure } from './assure.entity';
import { Garanties } from './Garanties.entity';
import { Vehicule } from './Vehicule.entity';
import { Payment } from 'src/paiement/entities/payment.entity';


@Entity()
export class ContratAuto {
  @PrimaryGeneratedColumn()
  num: number;

  @Column({ type: 'date' })
  dateSouscription: Date| string;

  @Column({ type: 'date' })
  dateExpiration: Date| string;
  @Column({ type: 'date', nullable: true })
  dateEffet?: Date| string;
  @Column({ type: 'varchar' })
  NatureContrat: string; 

  @Column({ type: 'varchar' })
  typePaiement: string; 

  @Column({ type: 'date' })
  echeances: Date| string;;

  @Column({ type: 'float' })
  cotisationNette: number; // Cotisation nette
 

  @Column({ type: 'float' })
  cotisationTotale: number;

  @Column({ type: 'float' })
  montantEcheance: number; // Montant de l'échéance
  @Column('varchar')
  packChoisi:string;
  @Column({ type: 'varchar', nullable: true, default: 'valide' })
  etat?: 'valide' | 'invalide';
  @ManyToOne(() => Assure, (assure) => assure.contrats)
  assure: Assure;

  @OneToMany(() => Garanties, (garantie) => garantie.contratAuto)
  garanties: Garanties[];

  @ManyToOne(() => Vehicule, (vehicule) => vehicule.contratAuto)
  vehicule: Vehicule;
  @OneToOne(() => Payment, payment => payment.contrat, {
    cascade: true, // Permet la création/suppression automatique
    nullable: true // Autorise l'absence de paiement
  })
  payment?: Payment;
}
