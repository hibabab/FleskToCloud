// payment.entity.ts
import { ContratAuto } from 'src/assurance-auto/entities/ContratAuto.entity';
import { ContratVie } from 'src/assurance-vie/entities/contrat-vie.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';


@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  paymentId: string;

  @Column()
  trackingId: string;

  @Column()
  status: string; // PENDING, PAID, FAILED

  @Column('float')
  amount: number;

  @Column({ nullable: true })
  paymentDate?: Date;
  @Column({ nullable: true }) // Ajoutez cette colonne pour stocker la FK
  contratNum: number;
  @OneToOne(() => ContratVie, contratVie => contratVie.payment, { nullable: true })
  @JoinColumn({ name: 'contratVieNum' })
  contratVie?: ContratVie;
  @OneToOne(() => ContratAuto, contrat => contrat.payment)
  @JoinColumn({ name: 'contratNum' }) 
  contrat: ContratAuto;
}