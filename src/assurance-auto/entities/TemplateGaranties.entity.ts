// src/entities/TemplateGaranties.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TypeGaranties } from '../enums/enums';

@Entity()
export class TemplateGaranties {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TypeGaranties }) 
  type: TypeGaranties;

  @Column({ type: 'float', nullable: true })
  capital: number | null;
  @Column({ type: 'float', nullable: true })
  franchise: number | null;
  @Column({ type: 'float' })
  cotisationNette: number;
}