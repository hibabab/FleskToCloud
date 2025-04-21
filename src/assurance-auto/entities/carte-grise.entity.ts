import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Vehicule } from './Vehicule.entity';


@Entity()
export class CarteGrise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  adresse: string;

  @Column()
  CIN: string;

  @Column()
  Activite: string;

  @Column()
  genre: string;

  @Column()
  typeConstructeur: string;

  @Column({ type: 'date' })
  DPMC: Date;

  @Column()
  constructeur: string;

  @Column()
  typeCommercial: string;

  @OneToOne(() => Vehicule, { onDelete: 'CASCADE' }) 
  @JoinColumn()
  vehicule: Vehicule;
}
