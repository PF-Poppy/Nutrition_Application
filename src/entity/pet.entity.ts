import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn} from 'typeorm';
import { Health } from "./health.entity";
import { AnimalType } from "./animaltype.entity";
import { User } from "./user.entity";

@Entity({ name: "pet" })
export class Pet {
  @PrimaryGeneratedColumn()
  pet_id!: number

  @Column()
  user_user_id!: string

  @Column()
  animaltype_type_id!: number

  @Column({type: "varchar", length: 255})
  pet_name!: string

  @Column("double")
  weight!: number

  @Column({type: "varchar", length: 255})
  neutering_status!: string

  @Column({type: "varchar", length: 255})
  age!: string

  @Column({type: "varchar", length: 255})
  activitie!: string

  @Column({type: "varchar", length: 255})
  factor_type!: string

  @Column("double")
  factor_number!: number

  @Column({type: "varchar", length: 255})
  physiology_status!: string

  @CreateDateColumn()
  create_date?: Date;

  @UpdateDateColumn()
  update_date?: Date;

  @OneToMany(() => Health, health => health.pet_pet_id)
  health!: Health[];

  @ManyToOne(() => AnimalType, animaltype => animaltype.type_id)
  @JoinColumn({ name: "animaltype_type_id" })
  animaltype!: AnimalType;

  @ManyToOne(() => User, user => user.user_id)
  @JoinColumn({ name: "user_user_id" })
  user!: User;
}