import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import { UserRole } from './userrole.entity';

@Entity({ name: "role" })
export class Role {
  @PrimaryGeneratedColumn("uuid")
  role_id!: string

  @Column({type: "varchar", length: 255})
  role_name!: string

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @OneToMany(() => UserRole, userRole => userRole.role_role_id)
  userRole?: UserRole[];
}