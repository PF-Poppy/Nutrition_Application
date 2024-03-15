import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany,  } from 'typeorm';
import { UserRole } from './userrole.entity';
import { Pet } from "./pet.entity";

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

  @OneToMany(() => Pet, pet => pet.user_user_id)
  pets?: Pet[];
}