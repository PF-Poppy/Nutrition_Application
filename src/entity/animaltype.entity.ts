import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import { Pet } from "./pet.entity";
import { Petrecipes } from "./petrecipes.entity";
import { Healthdetail } from "./healthdetail.entity";

@Entity({ name: "animaltype" })
export class AnimalType {
  @PrimaryGeneratedColumn()
  type_id!: number

  @Column({type: "varchar", length: 255})
  type_name!: string

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @OneToMany(() => Pet, pet => pet.animaltype_type_id)
  pets?: Pet[];

  @OneToMany(() => Healthdetail, healthdetail => healthdetail.animaltype_type_id)
  healthdetail?: Healthdetail[];
  
  @OneToMany(() => Petrecipes, petrecipes => petrecipes.animaltype_type_id)
  petrecipes?: Petrecipes[];
}