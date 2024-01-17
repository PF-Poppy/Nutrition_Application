import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity({ name: "userrole" })
export class UserRole {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  user_user_id!: string

  @Column()
  role_role_id!: string

  @CreateDateColumn()
  create_date?: Date;

  @UpdateDateColumn()
  update_date?: Date;

  @ManyToOne(() => User, user => user.user_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'user_user_id' })
  user?: User;

  @ManyToOne(() => Role, role => role.role_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'role_role_id' })
  role?: Role;

  
}