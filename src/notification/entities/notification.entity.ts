import { User } from 'src/auth/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';


@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
  @Column({ type: 'varchar', nullable: true })
  type: 'subscription_request' | 'general' |'vie_subscription_request'|"vie_subscription_rejected"|"vie_subscription_accepted"| null; // Nouveau champ

  @Column({ type: 'json', nullable: true })
  metadata: any; // Pour stocker les données du formulaire

  @Column({ type: 'varchar', nullable: true })
  status: string| null; 
  @Column({ type: 'varchar', nullable: true })
  link: string; 
  @Column({ default: true })
visibleToUser: boolean;
  @Column({ type: 'int', nullable: true })
  contractId: number; 
  @ManyToOne(() => User, (user) => user.notifications, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processedByAgentId' })
  processedByAgent: User | null;
}
