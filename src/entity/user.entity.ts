import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from './userrole.entity';
import { Favorite } from "./favorite.entity";
import { Pet } from "./pet.entity";
import { Usernotification } from "./usernotification.entity";

@Entity({ name: "user" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  user_id!: string

  @Column({type: "varchar", length: 255})
  firstname?: string

  @Column({type: "varchar", length: 255})
  lastname?: string;

  @Column({ type: 'int' , nullable: true})
  age?: number;

  @Column({type: "varchar", length: 255})
  username!: string;

  @Column({type: "varchar", length: 255})
  password!: string;

  @Column({ type: 'int' , default: 0})
  is_active?: number;

  @CreateDateColumn()
  create_date?: Date;

  @UpdateDateColumn()
  update_date?: Date;

  @OneToMany(() => UserRole, userRole => userRole.user_user_id)
  userRoles?: UserRole[];

  @OneToMany(() => Favorite, favorite => favorite.user_user_id)
  favorites?: Favorite[];

  @OneToMany(() => Pet, pet => pet.user_user_id)
  pets?: Pet[];

  @OneToMany(() => Usernotification, usernotification => usernotification.user_user_id)
  usernotifications?: Usernotification[];
}