import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, OneToOne, JoinColumn, VersionColumn} from 'typeorm';
import { Disease } from "./disease.entity";
import { AnimalType } from "./animaltype.entity";
import { User } from "./user.entity";
import { Profilepet } from "./profilepet.entity";

@Entity({ name: "pet" })
export class Pet {
  @PrimaryGeneratedColumn("uuid")
  pet_id!: string

  @Column()
  user_user_id!: string

  @Column()
  animaltype_type_id!: string

  @Column({type: "varchar", length: 255})
  pet_name!: string

  @CreateDateColumn()
  create_date?: Date;

  @UpdateDateColumn()
  update_date?: Date;

  @OneToMany(() => Disease, disease => disease.pet_pet_id)
  disease!: Disease[];

  @ManyToOne(() => AnimalType, animaltype => animaltype.type_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: "animaltype_type_id" })
  animaltype!: AnimalType;

  @ManyToOne(() => User, user => user.user_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: "user_user_id" })
  user!: User;

  @OneToOne(() => Profilepet, profilepet => profilepet.pet_pet_id)
  profilepet!: Profilepet;

  @VersionColumn({default: 0})
  version!: number;
}