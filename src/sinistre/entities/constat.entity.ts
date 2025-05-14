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
import { ConstatStatut } from '../Enum/constat-statut.enum';
import { Expert } from 'src/gestion-utilisateur/entities/Expert.entity';
import { AgentService } from 'src/gestion-utilisateur/entities/AgentService.entity';
import { PhotoJustificatif } from './photo.entity';
import { Vehicule } from 'src/assurance-auto/entities/Vehicule.entity';

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
  @ManyToOne(() => Vehicule, (vehicule) => vehicule.constats)
  @JoinColumn({ name: 'vehiculeId' })
  vehicule: Vehicule;
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
  @Column({ nullable: true })
  rapportUrl?: string; // URL du rapport PDF de l'expert
  // ✅ Nouvelle relation avec l’expert
  @ManyToOne(() => Expert, (expert) => expert.constats, { nullable: true })
  @JoinColumn({ name: 'expertId' })
  expert?: Expert | null;
  @ManyToOne(() => AgentService, (agentService) => agentService.constats, {
    nullable: true,
  })
  @JoinColumn({ name: 'agentServiceId' })
  agentService?: AgentService | null;
  @OneToMany(() => PhotoJustificatif, (photo) => photo.constat, {
    cascade: true,
    nullable: true,
  })
  photos?: PhotoJustificatif[];
}
