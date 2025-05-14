import { Adresse } from 'src/auth/entities/adresse.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { constat } from './constat.entity';

@Entity('conducteurs')
export class Conducteur {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @Column({ type: 'varchar', length: 255 })
  prenom: string;
  @ManyToOne(() => Adresse)
  @JoinColumn() // Associe la colonne userId avec l'adresse
  adresse: Adresse;

  @Column({ type: 'varchar', length: 255 })
  numPermis: string; // Champ numérique pour le numéro de permis
  @OneToOne(() => constat, { nullable: true })
  @JoinColumn()
  constat?: constat; // Relation avec constats qui peut être NULL
}
