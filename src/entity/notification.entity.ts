import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, OneToMany, } from 'typeorm';
import { Usernotification } from "./usernotification.entity";

@Entity({ name: "notification" })
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  notification_id!: string

  @Column({type: "varchar", length: 255})
  notification_message!: string

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @DeleteDateColumn()
  expire_date?: Date

  @OneToMany(() => Usernotification, usernotification => usernotification.notification_notification_id)
  usernotification?: Usernotification[];

  
}