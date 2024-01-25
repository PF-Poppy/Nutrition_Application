import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { AnimalType } from "./animaltype.entity";
import { Nutritionsecondary } from "./nutritionsecondary.entity";

@Entity({ name: "defaultnutrition" })
export class Defaultnutrition {
  @PrimaryGeneratedColumn("uuid")
  defaultnutrition_id!: string

  @Column()
  animaltype_type_id!: string

  @Column()
  nutritionsecondary_nutrition_id!: string

  @Column({type: "double",default: 0.0})
  value_max! : number

  @Column({type: "double",default: 0.0})
  value_min! : number

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @ManyToOne(() => AnimalType, animaltype => animaltype.type_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'animaltype_type_id' })
  animaltype!: AnimalType;

  @ManyToOne(() => Nutritionsecondary, nutritionsecondary => nutritionsecondary.nutrition_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'nutritionsecondary_nutrition_id' })
  nutritionsecondary!: Nutritionsecondary;

  
}