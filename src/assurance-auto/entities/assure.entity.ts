import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ContratAuto } from './ContratAuto.entity';
import { User } from 'src/auth/entities/user.entity';


@Entity()
export class Assure {
  @PrimaryGeneratedColumn()
  NumSouscription:number;

  @ManyToOne(() => User)
  user: User;
  @Column({ type: 'int' })
  bonusMalus: number;

  @OneToMany(() => ContratAuto, (contratAuto) => contratAuto.assure)
  contrats: ContratAuto[];
}
