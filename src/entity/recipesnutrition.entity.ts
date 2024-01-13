import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Nutrition } from "./nutrition.entity";
import { Petrecipes } from "./petrecipes.entity";

@Entity({ name: "recipesnutrition" })
export class Recipenutrition {
  @PrimaryGeneratedColumn("uuid")
  recipes_nutrition_id!: string

  @Column()
  nutrition_nutrition_id!: string

  @Column()
  petrecipes_recipes_id!: string 

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

  @ManyToOne(() => Nutrition, nutrition => nutrition.nutrition_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'nutrition_nutrition_id' })
  nutrition!: Nutrition;

  @ManyToOne(() => Petrecipes, petrecipes => petrecipes.recipes_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'petrecipes_recipes_id' })
  petrecipes!: Petrecipes;
}