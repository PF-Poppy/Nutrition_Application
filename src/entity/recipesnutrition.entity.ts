import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { Nutritionsecondary } from "./nutritionsecondary.entity";
import { Petrecipes } from "./petrecipes.entity";

@Entity({ name: "recipesnutrition" })
export class Recipenutrition {
  @PrimaryGeneratedColumn("uuid")
  recipes_nutrition_id!: string

  @Column()
  nutritionsecondary_nutrition_id!: string

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

  @ManyToOne(() => Nutritionsecondary, nutritionsecondary => nutritionsecondary.nutrition_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'nutritionsecondary_nutrition_id' })
  nutritionsecondary!: Nutritionsecondary;

  @ManyToOne(() => Petrecipes, petrecipes => petrecipes.recipes_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'petrecipes_recipes_id' })
  petrecipes!: Petrecipes;

  
}