import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, } from 'typeorm';
import { Pet } from "./pet.entity";
import { Petrecipes } from "./petrecipes.entity";
import { Diseasedetail } from "./diseasedetail.entity";
import { Physiology } from "./physiology.entity";
import { Baseanimaltype } from "./baseanimaltype.entity";
import { Defaultnutrition } from "./defaultnutrition.entity";

@Entity({ name: "animaltype" })
export class AnimalType {
  @PrimaryGeneratedColumn("uuid")
  type_id!: string

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

  @OneToMany(() => Diseasedetail, diseasedetail => diseasedetail.animaltype_type_id)
  diseasedetail?: Diseasedetail[];
  
  @OneToMany(() => Petrecipes, petrecipes => petrecipes.animaltype_type_id)
  petrecipes?: Petrecipes[];

  @OneToMany(() => Physiology, physiology => physiology.animaltype)
  physiology?: Physiology[];
  
  @OneToMany(() => Baseanimaltype, baseanimaltype => baseanimaltype.animaltype)
  baseanimaltype?: Baseanimaltype[];

  @OneToMany(() => Defaultnutrition, defaultnutrition => defaultnutrition.animaltype)
  defaultnutrition?: Defaultnutrition[];
}