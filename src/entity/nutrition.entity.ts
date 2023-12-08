import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import { Healthnutrition } from "./healthnutrition.entity";
import { Ingredientnutrition } from './ingredientnutrition.entity';

@Entity({ name: "nutrition" })
export class Nutrition {
  @PrimaryGeneratedColumn()
  nutrition_id!: number

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

  @OneToMany(() => Healthnutrition, healthnutrition => healthnutrition.nutrition_nutrition_id)
  healthnutrition!: Healthnutrition[];

  @OneToMany(() => Ingredientnutrition, ingredientnutrition => ingredientnutrition.nutrition_nutrition_id)
  ingredientnutrition!: Ingredientnutrition[];
}