import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity()

export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar'})
  email: string;

  @Column({ type: 'varchar' })
  motDePasse: string;

  @Column({ type: 'varchar' })
  role: string;

 
}