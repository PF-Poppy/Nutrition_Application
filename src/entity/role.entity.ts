import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import { UserRole } from './userrole.entity';

@Entity({ name: "role" })
export class Role {
  @PrimaryGeneratedColumn()
  role_id!: number

  @Column({type: "varchar", length: 255})
  role_name!: string

  @CreateDateColumn()
  create_date?: Date;

  @UpdateDateColumn()
  update_date?: Date;

  @OneToMany(() => UserRole, userRole => userRole.role_role_id)
  userRole?: UserRole[];
}