import "reflect-metadata";
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert, Not, IsNull} from 'typeorm';
import { AppDataSource } from "../db/data-source";
import { UserRole } from './userrole.entity';
import { Favorite } from "./favorite.entity";
import { Pet } from "./pet.entity";
import { Usernotification } from "./usernotification.entity";

@Entity({ name: "user" })
export class User {
  @PrimaryColumn()
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

  @OneToMany(() => UserRole, userRole => userRole.user_user_id,{ onDelete: 'CASCADE' ,cascade: true })
  userRoles?: UserRole[];

  @OneToMany(() => Favorite, favorite => favorite.user_user_id,{ onDelete: 'CASCADE' ,cascade: true })
  favorites?: Favorite[];

  @OneToMany(() => Pet, pet => pet.user_user_id,{ onDelete: 'CASCADE' ,cascade: true })
  pets?: Pet[];

  @OneToMany(() => Usernotification, usernotification => usernotification.user_user_id,{ onDelete: 'CASCADE' ,cascade: true })
  usernotifications?: Usernotification[];

  @BeforeInsert()
  async generateUserId() {
    const lastEntity = await AppDataSource.getRepository(User).findOne({
      where: { user_id: Not(IsNull()) },
      order: { user_id: 'DESC' },
    });

    let newId = 'USER0001';
    if (lastEntity) {
      const lastId = lastEntity.user_id;
      const lastNumber = parseInt(lastId.slice(4), 10);
      const numberOfDigits = lastId.length - 'USER'.length;
      const nextNumber = lastNumber + 1;
      newId = `USER${nextNumber.toString().padStart(numberOfDigits, '0')}`;
    }

    this.user_id = newId;
  }
}