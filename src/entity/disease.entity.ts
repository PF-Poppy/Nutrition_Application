import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn} from 'typeorm';
import { Pet } from "./pet.entity";
import { Diseasedetail } from "./diseasedetail.entity";

@Entity({ name: "disease" })
export class Disease {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  pet_pet_id!: string

  @Column()
  diseasedetail_disease_id!: string

  @CreateDateColumn()
  create_date?: Date;

  @UpdateDateColumn()
  update_date?: Date;

  @ManyToOne(() => Pet, pet => pet.pet_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'pet_pet_id' })
  pet!: Pet;

  @ManyToOne(() => Diseasedetail, diseasedetail => diseasedetail.disease_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'diseasedetail_disease_id' })
  diseasedetail!: Diseasedetail;
}