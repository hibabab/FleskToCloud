import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Adresse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rue: string;

  @Column({ nullable: true })
  numMaison: number; // Rendre cette colonne nullable

  @Column()
  ville: string;

  @Column()
  gouvernat: string; // Nouveau champ ajouté

  @Column()
  codePostal: number;

  @Column()
  pays: string;

  // Relation avec User : plusieurs utilisateurs peuvent avoir la même adresse
  @OneToMany(() => User, (user) => user.adresse)
  users: User[];
}
