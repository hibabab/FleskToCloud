import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { AssureVie } from './AssureVie.entity';
import { Payment } from 'src/paiement/entities/payment.entity';
import { Emprunt } from './Emprunt.entity';

@Entity('contrat_vie')
export class ContratVie {
  @PrimaryGeneratedColumn()
  numero: number;
  @Column({ type: 'date' })
  dateEffet: Date;
  @Column('decimal', { precision: 12, scale: 2 })
  cotisation: number;
  @Column('text')
  garanties: string;
  @Column({ type: 'date',nullable: true })
  dateExpiration:Date;
  @Column({ type: 'varchar', nullable: true,  })
  etat?: 'valide' | 'invalide';
  @ManyToOne(() => AssureVie, (assureVie) => assureVie.contratsVie)
assureVie: AssureVie;
@OneToOne(() => Payment, payment => payment.contratVie, { nullable: true })
payment: Payment;
@OneToOne(() => Emprunt, emprunt => emprunt.contratVie, { cascade: true })
@JoinColumn()
emprunt: Emprunt;
  static dateEffet: any;
  static dateExpiration: any;
}
