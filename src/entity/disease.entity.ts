import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn} from 'typeorm';
import { Pet } from "./pet.entity";
import { Diseasedetail } from "./diseasedetail.entity";

@Entity({ name: "disease" })
export class Disease {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  pet_pet_id!: number

  @Column()
  diseasedetail_disease_id!: number

  @CreateDateColumn()
  create_date?: Date;

  @UpdateDateColumn()
  update_date?: Date;

  @ManyToOne(() => Pet, pet => pet.pet_id)
  @JoinColumn({ name: 'pet_pet_id' })
  pet!: Pet;

  @ManyToOne(() => Diseasedetail, diseasedetail => diseasedetail.disease_id)
  @JoinColumn({ name: 'diseasedetail_disease_id' })
  diseasedetail!: Diseasedetail;
}