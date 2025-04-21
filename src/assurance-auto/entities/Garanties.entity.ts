
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ContratAuto } from './ContratAuto.entity';
import { TypeGaranties } from '../enums/enums';
import { TemplateGaranties } from './TemplateGaranties.entity';



// src/entities/Garanties.entity.ts
@Entity()
export class Garanties {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TypeGaranties })
  type: TypeGaranties;

  @Column({ type: 'float', nullable: true })
  capital: number | null;

  @Column({ type: 'float' })
  cotisationNette: number;

  @Column({ type: 'float', nullable: true })
  franchise: number | null;

  @ManyToOne(() => ContratAuto, (contrat) => contrat.garanties)
  @JoinColumn({ name: 'contratAutoId' }) // Assure la liaison avec la clé étrangère
  contratAuto: ContratAuto;
  

  // Référence au template (optionnelle)
  @ManyToOne(() => TemplateGaranties, { nullable: true })
  @JoinColumn({ name: 'templateId' })
  template: TemplateGaranties | null;
}