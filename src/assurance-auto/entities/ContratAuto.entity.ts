
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
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
  @Column({ type: 'float' })
 cotisationNette: number; 
  @Column({ type: 'float' })
  cotisationTotale: number; 
  @Column('varchar')
  packChoisi:string;
  @Column({ type: 'varchar', nullable: true, default: 'valide' })
  etat?: 'valide' | 'invalide'| 'résilié';
  @ManyToOne(() => Assure, (assure) => assure.contrats)
  assure: Assure;

  @OneToMany(() => Garanties, (garantie) => garantie.contratAuto)
  garanties: Garanties[];

  @OneToOne(() => Vehicule, (vehicule) => vehicule.contratAuto)
  @JoinColumn() 
  vehicule: Vehicule;
 @OneToMany(() => Payment, payment => payment.contrat)
  payment: Payment[];
}
