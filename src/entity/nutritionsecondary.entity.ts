import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import { Diseasenutrition } from "./diseasenutrition.entity";
import { Recipenutrition } from "./recipesnutrition.entity";

@Entity({ name: "nutritionsecondary" })
export class Nutritionsecondary {
  @PrimaryGeneratedColumn("uuid")
  nutrition_id!: string

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

  @OneToMany(() => Diseasenutrition, diseasedetail => diseasedetail.nutritionsecondary_nutrition_id)
  diseasedetail!: Diseasenutrition[];

  @OneToMany(() => Recipenutrition, recipenutrition => recipenutrition.nutritionsecondary_nutrition_id)
  recipenutrition!: Recipenutrition[];
}