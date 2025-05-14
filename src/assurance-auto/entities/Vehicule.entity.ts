import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ContratAuto } from './ContratAuto.entity';
import { CarteGrise } from './carte-grise.entity';
import { constat } from 'src/sinistre/entities/constat.entity';

@Entity()
export class Vehicule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  marque: string;

  @Column()
  model: string;

  @Column({ unique: true })
  Imat: string;

  @Column({ nullable: true })
  energie: string;

  @Column()
  nbPlace: number;

  @Column({ type: 'date' })
  DPMC: Date;

  @Column()
  cylindree: number;

  @Column({ nullable: true })
  chargeUtil: number;

  @Column()
  valeurNeuf: number;

  @Column({ unique: true })
  numChassis: string;

  @Column({ type: 'float' })
  poidsVide: number;

  @Column()
  puissance: number;

  @OneToOne(() => CarteGrise, (carteGrise) => carteGrise.vehicule)
  carteGrise: CarteGrise;
  @OneToOne(() => ContratAuto, (contratAuto) => contratAuto.vehicule)
  contratAuto: ContratAuto;
  @OneToMany(() => constat, (constat) => constat.vehicule)
  constats: constat[];
}
