import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Ingredients } from "./ingredients.entity";
import { Petrecipes } from "./petrecipes.entity";

@Entity({ name: "recipeingredients" })
export class Recipeingredients {
  @PrimaryGeneratedColumn()
  recipe_ingredient_id!: number

  @Column()
  ingredients_ingredient_id!: number

  @Column()
  petrecipes_recipes_id!: number 

  @Column()
  quantity!: number

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @ManyToOne(() => Ingredients, ingredients => ingredients.ingredient_id,{ onDelete: 'CASCADE' ,cascade: true })
  @JoinColumn({ name: 'ingredients_ingredient_id' })
  ingredients!: Ingredients;

  @ManyToOne(() => Petrecipes, petrecipes => petrecipes.recipes_id,{ onDelete: 'CASCADE' ,cascade: true })
  @JoinColumn({ name: 'petrecipes_recipes_id' })
  petrecipes!: Petrecipes;
}