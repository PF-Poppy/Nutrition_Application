import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import { Diseasenutrition } from "./diseasenutrition.entity";
import { Ingredientnutrition } from './ingredientnutrition.entity';

@Entity({ name: "nutrition" })
export class Nutrition {
  @PrimaryGeneratedColumn("uuid")
  nutrition_id!: string

  @Column({type: "varchar", length: 255})
  nutrient_name!: string

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @OneToMany(() => Diseasenutrition, diseasedetail => diseasedetail.nutrition_nutrition_id)
  diseasedetail!: Diseasenutrition[];

  @OneToMany(() => Ingredientnutrition, ingredientnutrition => ingredientnutrition.nutrition_nutrition_id)
  ingredientnutrition!: Ingredientnutrition[];
}