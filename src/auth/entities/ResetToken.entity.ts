import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ResetToken {
  @PrimaryGeneratedColumn('uuid') // Génère un UUID comme colonne primaire
  id: string;
  @Column()
  userId: string;
  @Column({ unique: true })
  token: string;
  @Column()
  expiryDate: Date;
}
