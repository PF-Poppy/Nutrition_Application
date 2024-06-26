import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, } from 'typeorm';
import { Diseasenutrition } from "./diseasenutrition.entity";
import { Recipenutrition } from "./recipenutrition.entity";
import { Ingredientnutritionsecondary } from "./ingredientnutritionsecondary.entity";
import { Nutrientsrequirement } from "./nutrientsrequirement.entity";
import { Basenutrition } from "./basenutrition.entity";

@Entity({ name: "nutritionsecondary" })
export class Nutritionsecondary {
  @PrimaryGeneratedColumn("uuid")
  nutrition_id!: string

  @Column({nullable: true})
  order_value!: Number

  @Column({type: "varchar", length: 255})
  nutrient_name!: string

  @Column({type: "varchar", length: 255, nullable: true})
  nutrient_unit!: string

  @Column({type: "varchar", length: 255, nullable: true})
  formula!: string

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @OneToMany(() => Diseasenutrition, diseasedetail => diseasedetail.nutritionsecondary_nutrition_id)
  diseasedetail!: Diseasenutrition[];

  @OneToMany(() => Recipenutrition, recipenutrition => recipenutrition.nutritionsecondary_nutrition_id)
  recipenutrition!: Recipenutrition[];

  @OneToMany(() => Ingredientnutritionsecondary, ingredientnutritionsecondary => ingredientnutritionsecondary.nutritionsecondary_nutrition_id)
  ingredientnutritionsecondary!: Ingredientnutritionsecondary[];

  @OneToMany(() => Nutrientsrequirement, nutrientsrequirement => nutrientsrequirement.physiology.physiology_id)
  nutrientsrequirement?: Nutrientsrequirement[];

  @OneToMany(() => Basenutrition, basenutrition => basenutrition.nutritionsecondary)
  basenutrition?: Basenutrition[];
}