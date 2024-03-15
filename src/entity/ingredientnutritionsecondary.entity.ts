import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { Nutritionsecondary } from "./nutritionsecondary.entity";
import { Ingredients } from './ingredients.entity';

@Entity({ name: "ingredientnutritionsecondary" })
export class Ingredientnutritionsecondary {
  @PrimaryGeneratedColumn("uuid")
  ingredient_nutritionsecondary_id!: string

  @Column()
  nutritionsecondary_nutrition_id!: string

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
  
  @ManyToOne(() => Nutritionsecondary, nutritionsecondary => nutritionsecondary.nutrition_id,{onDelete: 'CASCADE'})
  @JoinColumn({name: "nutritionsecondary_nutrition_id"})
  nutritionsecondary!: Nutritionsecondary;

  @ManyToOne(() => Ingredients, ingredients => ingredients.ingredient_id,{onDelete: 'CASCADE'})
  @JoinColumn({name: "ingredients_ingredient_id"})
  ingredients!: Ingredients;
}