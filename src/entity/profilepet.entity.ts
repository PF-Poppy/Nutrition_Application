import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, VersionColumn} from 'typeorm';
import { Pet } from "./pet.entity";

@Entity({ name: "profilepet" })
export class Profilepet {
  @PrimaryGeneratedColumn("uuid")
  profile_id!: string

  @Column()
  pet_pet_id!: string

  @Column("double")
  weight!: number

  @Column({type: "varchar", length: 255})
  neutering_status!: string

  @Column()
  petBirthDate!: Date

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

  @OneToOne(() => Pet, pet => pet.pet_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: "pet_pet_id" }) 
  pet!: Pet;

  @VersionColumn({default: 0})
  version!: number;
}