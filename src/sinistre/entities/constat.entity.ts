
import { Adresse } from 'src/auth/entities/adresse.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Temoin } from './temoin.entity';
import { Conducteur } from './conducteur.entity';
import { User } from 'src/auth/entities/user.entity';
import { Expert } from 'src/gestion-utilisateur/entities/Expert.entity';
import { AgentService } from 'src/gestion-utilisateur/entities/AgentService.entity';
export enum ConstatStatut {
  EN_ATTENTE = 'En attente',
  EN_COURS = 'En cours de traitement',
  CLOTURE = 'Clôturé',
}

@Entity('constat')
export class constat {
  @PrimaryGeneratedColumn()
  idConstat: number;

  @Column({ type: 'date' })
  dateAccident: Date;

  @Column({ type: 'time' })
  heure: string;

  @ManyToOne(() => Adresse)
  @JoinColumn()
  lieu: Adresse;

  @Column({ type: 'boolean', default: false })
  blessees: boolean;

  @Column({ type: 'boolean', default: false })
  degatMateriels: boolean;

  @OneToMany(() => Temoin, (temoin) => temoin.constat, { nullable: true })
  temoins?: Temoin[];

  @OneToOne(() => Conducteur, { nullable: true }) // 📌 Conducteur peut être null
  @JoinColumn()
  conducteur?: Conducteur | null;
  @ManyToOne(() => User, (user) => user.constats, { nullable: true }) // Ici nullable a du sens
  @JoinColumn({ name: 'userId' })
  user?: User; // Le ? rend la propriété optionnelle en TypeScript
  @Column({
    type: 'enum',
    enum: ConstatStatut,
    default: ConstatStatut.EN_ATTENTE,
  })
  statut: ConstatStatut;
  @Column({ nullable: true })
  pathurl?: string; // Stockera le chemin comme '/upload/constat/123456789-fichier.pdf'
  // ✅ Nouveau champ : montant estimé
  @Column({ type: 'float', nullable: true })
  montantEstime?: number;

  // ✅ Nouvelle relation avec l’expert
  @ManyToOne(() => Expert, (expert) => expert.constats, { nullable: true })
  @JoinColumn({ name: 'expertId' })
  expert?: Expert | null;
  @ManyToOne(() => AgentService, (agentService) => agentService.constats, {
    nullable: true,
  })
  @JoinColumn({ name: 'agentServiceId' })
  agentService?: AgentService | null;
}
