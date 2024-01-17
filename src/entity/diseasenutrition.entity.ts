import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { Diseasedetail } from "./diseasedetail.entity";
import { Nutritionsecondary } from "./nutritionsecondary.entity";

@Entity({ name: "diseasenutrition" })
export class Diseasenutrition {
  @PrimaryGeneratedColumn("uuid")
  diseasenutrition_id!: string

  @Column()
  diseasedetail_disease_id!: string

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

  @ManyToOne(() => Diseasedetail, diseasedetail => diseasedetail.disease_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'diseasedetail_disease_id' })
  diseasedetail!: Diseasedetail;

  @ManyToOne(() => Nutritionsecondary, nutritionsecondary => nutritionsecondary.nutrition_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'nutritionsecondary_nutrition_id' })
  nutritionsecondary!: Nutritionsecondary;

  
}