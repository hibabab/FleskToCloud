// src/auth/entities/refresh-token.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index() // Index pour les recherches rapides
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' }) // Suppression en cascade
  @JoinColumn({ name: 'userId' })
  user: User;
}
