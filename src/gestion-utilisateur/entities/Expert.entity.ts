import { User } from 'src/auth/entities/user.entity';
import { constat } from 'src/sinistre/entities/constat.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Expert {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User)
  user: User;
  @Column({ type: 'boolean', default: true })
  disponibilite: boolean;

  @Column({ type: 'int' })
  nbAnneeExperience: number;

  @Column({ type: 'varchar', length: 255 })
  specialite: string;

  @Column({ type: 'date' })
  dateInscri: Date;
  // ✅ Nouvelle relation avec les constats
  @OneToMany(() => constat, (constat) => constat.expert, { nullable: true })
  constats?: constat[];
}
