import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Adresse } from './adresse.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  Cin: number;

  @Column()
  telephone: string;

  @Column()
  email: string;

  @Column()
  date_naissance: Date;

  @Column()
  password: string;

  // In your User entity
  @ManyToOne(() => Adresse, (adresse) => adresse.users, { cascade: true })
  @JoinColumn()
  adresse: Adresse;

  @Column()
  role: string;

  @Column({ default: false })
  isBlocked: boolean;
}
