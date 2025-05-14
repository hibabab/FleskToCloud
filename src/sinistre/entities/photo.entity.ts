import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { constat } from './constat.entity';

@Entity('photo_justificatif')
export class PhotoJustificatif {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string; // Chemin du fichier ou URL de la photo

  @ManyToOne(() => constat, (constat) => constat.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'constatId' })
  constat: constat;
}
