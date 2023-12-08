import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Healthdetail } from "./healthdetail.entity";
import { Nutrition } from "./nutrition.entity";

@Entity({ name: "healthnutrition" })
export class Healthnutrition {
  @PrimaryGeneratedColumn()
  healthnutrition_id!: number

  @Column()
  healthdetail_health_id!: number

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

  @ManyToOne(() => Healthdetail, healthdetail => healthdetail.health_id)
  @JoinColumn({ name: 'healthdetail_health_id' })
  healthdetail!: Healthdetail;

  @ManyToOne(() => Nutrition, nutrition => nutrition.nutrition_id)
  @JoinColumn({ name: 'nutrition_nutrition_id' })
  nutrition!: Nutrition;
}