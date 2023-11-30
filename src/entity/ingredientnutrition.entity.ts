import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Nutrition } from './nutrition.entity';
import { Ingredients } from './ingredients.entity';

@Entity({ name: "ingredientnutrition" })
export class Ingredientnutrition {
  @PrimaryGeneratedColumn()
  ingredient_nutrition_id!: number

  @Column()
  nutrition_nutrition_id!: number

  @Column()
  ingredients_ingredient_id!: number

  @Column({type: "double"})
  nutrient_value! : number

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string
  
  @ManyToOne(() => Nutrition, nutrition => nutrition.nutrition_id,{ onDelete: 'CASCADE' ,cascade: true })
  @JoinColumn({name: "nutrition_nutrition_id"})
  nutrition!: Nutrition;

  @ManyToOne(() => Ingredients, ingredients => ingredients.ingredient_id,{ onDelete: 'CASCADE' ,cascade: true })
  @JoinColumn({name: "ingredients_ingredient_id"})
  ingredients!: Ingredients;
}