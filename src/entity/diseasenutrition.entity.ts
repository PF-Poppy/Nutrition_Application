import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Diseasedetail } from "./diseasedetail.entity";
import { Nutrition } from "./nutrition.entity";

@Entity({ name: "diseasenutrition" })
export class Diseasenutrition {
  @PrimaryGeneratedColumn()
  diseasenutrition_id!: number

  @Column()
  diseasedetail_disease_id!: number

  @Column()
  nutrition_nutrition_id!: number

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

  @ManyToOne(() => Diseasedetail, diseasedetail => diseasedetail.disease_id)
  @JoinColumn({ name: 'diseasedetail_disease_id' })
  diseasedetail!: Diseasedetail;

  @ManyToOne(() => Nutrition, nutrition => nutrition.nutrition_id)
  @JoinColumn({ name: 'nutrition_nutrition_id' })
  nutrition!: Nutrition;
}