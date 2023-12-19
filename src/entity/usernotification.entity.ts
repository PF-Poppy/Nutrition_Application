import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { User } from "./user.entity";
import { Notification } from "./notification.entity";

@Entity({ name: "usernotification" })
export class Usernotification {
  @PrimaryGeneratedColumn("uuid")
  user_noti_id!: string

  @Column()
  user_user_id!: string

  @Column()
  notification_notification_id!: string

  @CreateDateColumn()
  create_date?: Date;

  @UpdateDateColumn()
  update_date?: Date;

  @ManyToOne(() => User, user => user.user_id)
  @JoinColumn({ name: 'user_user_id' })
  user!: User;

  @ManyToOne(() => Notification, notification => notification.notification_id)
  @JoinColumn({ name: 'notification_notification_id' })
  notification!: Notification;
}