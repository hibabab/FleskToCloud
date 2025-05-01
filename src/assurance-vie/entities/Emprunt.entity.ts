// Emprunt.entity.ts
import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ContratVie } from './contrat-vie.entity';


@Entity('emprunt')
export class Emprunt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  organismePreteur: string;

  @Column('decimal', { precision: 12, scale: 2 })
  montantPret: number;

  @Column({ type: 'date' })
  dateEffet: Date;

  @Column({ type: 'date' })
  datePremierR: Date;

  @Column({ type: 'date' })
  dateDernierR: Date;

  @Column()
  typeAmortissement: string;

  @Column()
  periodiciteAmortissement: string;

  @Column('decimal', { precision: 5, scale: 2 })
  tauxInteret: number;

  @OneToOne(() => ContratVie, contratVie => contratVie.emprunt)
  contratVie: ContratVie;
}