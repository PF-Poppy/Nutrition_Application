import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { User } from "./user.entity";
import { Notification } from "./notification.entity";

@Entity({ name: "usernotification" })
export class Usernotification {
  @PrimaryGeneratedColumn()
  user_noti_id!: number

  @Column()
  user_user_id!: string

  @Column()
  notification_notification_id!: number

  @CreateDateColumn()
  create_date?: Date;

  @UpdateDateColumn()
  update_date?: Date;

  @ManyToOne(() => User, user => user.user_id,{ onDelete: 'CASCADE' ,cascade: true })
  @JoinColumn({ name: 'user_user_id' })
  user!: User;

  @ManyToOne(() => Notification, notification => notification.notification_id,{ onDelete: 'CASCADE' ,cascade: true })
  @JoinColumn({ name: 'notification_notification_id' })
  notification!: Notification;
}