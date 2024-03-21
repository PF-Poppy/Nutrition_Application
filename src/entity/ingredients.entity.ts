import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, } from 'typeorm';
import { Ingredientnutritionprimary } from "./ingredientnutritionprimary.entity";
import { Ingredientnutritionsecondary } from "./ingredientnutritionsecondary.entity";
import { Recipeingredients } from "./recipeingredients.entity";

@Entity({ name: "ingredients" })
export class Ingredients {
  @PrimaryGeneratedColumn("uuid")
  ingredient_id!: string

  @Column({type: "varchar", length: 255})
  ingredient_name!: string

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @OneToMany(() => Ingredientnutritionprimary, ingredientnutritionprimary => ingredientnutritionprimary.ingredients_ingredient_id)
  ingredientnutritionprimary?: Ingredientnutritionprimary[];

  @OneToMany(() => Ingredientnutritionsecondary, ingredientnutritionsecondary => ingredientnutritionsecondary.ingredients_ingredient_id)
  ingredientnutritionsecondary?: Ingredientnutritionsecondary[];

  @OneToMany(() => Recipeingredients, recipeingredients => recipeingredients.ingredients_ingredient_id)
  recipeingredients?: Recipeingredients[];
}