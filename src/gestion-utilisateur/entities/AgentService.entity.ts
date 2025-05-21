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
export class AgentService {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;
  @Column({ type: 'varchar', length: 255 })
  specialite: string;

  @Column({ type: 'date' })
  dateEmbauche: Date;
  @OneToMany(() => constat, (constat) => constat.agentService)
  constats: constat[];
}
