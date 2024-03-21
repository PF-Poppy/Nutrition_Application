import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, } from 'typeorm';
import { AnimalType } from "./animaltype.entity";
import { Recipeingredients } from "./recipeingredients.entity";
import { Recipenutrition } from "./recipenutrition.entity";

@Entity({ name: "petrecipes" })
export class Petrecipes {
  @PrimaryGeneratedColumn("uuid")
  recipes_id!: string

  @Column()
  animaltype_type_id!: string

  @Column({type: "varchar", length: 255})
  recipes_name!: string

  @Column({type: "varchar", length: 255, nullable: true})
  description?: string

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string
  
  @OneToMany(() => Recipeingredients, recipeingredients => recipeingredients.petrecipes_recipes_id)
  recipeingredients?: Recipeingredients[];

  @OneToMany(() => Recipenutrition, recipenutrition => recipenutrition.petrecipes_recipes_id)
  recipenutrition?: Recipenutrition[];

  @ManyToOne(() => AnimalType, animaltype => animaltype.type_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'animaltype_type_id' })
  animaltype!: AnimalType;

  
}