import { Adresse } from 'src/auth/entities/adresse.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { constat } from './constat.entity';

@Entity('temoins')
export class Temoin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nom: string;
  @Column({ type: 'varchar', length: 255 })
  prenom: string;

  @ManyToOne(() => Adresse, { nullable: false })
  @JoinColumn() // Associe la colonne userId avec l'adresse
  adresse: Adresse;

  @Column({ type: 'varchar', length: 255 })
  telephone: string;
  @ManyToOne(() => constat, (constat) => constat.temoins)
  constat: constat;
}
