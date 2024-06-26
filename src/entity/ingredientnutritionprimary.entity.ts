import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { Nutritionprimary } from "./nutritionprimary.entity";
import { Ingredients } from './ingredients.entity';

@Entity({ name: "ingredientnutritionprimary" })
export class Ingredientnutritionprimary {
  @PrimaryGeneratedColumn("uuid")
  ingredient_nutritionprimary_id!: string

  @Column()
  nutritionprimary_nutrition_id!: string

  @Column()
  ingredients_ingredient_id!: string

  @Column({type: "double",default: 0.0})
  nutrient_value! : number

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string
  
  @ManyToOne(() => Nutritionprimary, nutritionprimary => nutritionprimary.nutrition_id,{onDelete: 'CASCADE'})
  @JoinColumn({name: "nutritionprimary_nutrition_id"})
  nutritionprimary!: Nutritionprimary;

  @ManyToOne(() => Ingredients, ingredients => ingredients.ingredient_id,{onDelete: 'CASCADE'})
  @JoinColumn({name: "ingredients_ingredient_id"})
  ingredients!: Ingredients;  
}