import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ContratVie } from './contrat-vie.entity';


@Entity()
export class AssureVie {
  @PrimaryGeneratedColumn()
  numSouscription: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column()
  situationProfessionnelle: string;

  @Column('decimal', { precision: 10, scale: 2 })
  revenuMensuel: number;
  @OneToMany(() => ContratVie, (contrat) => contrat.assureVie)
  contratsVie: ContratVie[];
}
