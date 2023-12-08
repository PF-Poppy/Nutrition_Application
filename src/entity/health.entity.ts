import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Pet } from "./pet.entity";
import { Healthdetail } from "./healthdetail.entity";

@Entity({ name: "health" })
export class Health {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  pet_pet_id!: number

  @Column()
  healthdetail_health_id!: number

  @CreateDateColumn()
  create_date?: Date;

  @ManyToOne(() => Pet, pet => pet.pet_id)
  @JoinColumn({ name: 'pet_pet_id' })
  pet!: Pet;

  @ManyToOne(() => Healthdetail, healthdetail => healthdetail.health_id)
  @JoinColumn({ name: 'healthdetail_health_id' })
  healthdetail!: Healthdetail;
}