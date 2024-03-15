import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, } from 'typeorm';
import { Ingredientnutritionprimary } from "./ingredientnutritionprimary.entity";

@Entity({ name: "nutritionprimary" })
export class Nutritionprimary {
  @PrimaryGeneratedColumn("uuid")
  nutrition_id!: string

  @Column({nullable: true})
  order_value!: Number

  @Column({type: "varchar", length: 255})
  nutrient_name!: string

  @Column({type: "varchar", length: 255, nullable: true})
  nutrient_unit!: string

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @OneToMany(() => Ingredientnutritionprimary, ingredientnutritionprimary => ingredientnutritionprimary.nutritionprimary_nutrition_id)
  ingredientnutritionprimary!: Ingredientnutritionprimary[];
}