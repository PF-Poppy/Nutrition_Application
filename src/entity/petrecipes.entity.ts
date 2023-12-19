import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn} from 'typeorm';
import { Favorite } from "./favorite.entity";
import { AnimalType } from "./animaltype.entity";
import { Recipeingredients } from "./recipeingredients.entity";

@Entity({ name: "petrecipes" })
export class Petrecipes {
  @PrimaryGeneratedColumn("uuid")
  recipes_id!: string

  @Column()
  animaltype_type_id!: string

  @Column({type: "varchar", length: 255})
  recipes_name!: string

  @Column({type: "varchar", length: 255})
  description!: string

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string
  
  @OneToMany(() => Favorite, favorite => favorite.petrecipes_recipes_id)
  favorites?: Favorite[];

  @OneToMany(() => Recipeingredients, recipeingredients => recipeingredients.petrecipes_recipes_id)
  recipeingredients?: Recipeingredients[];

  @ManyToOne(() => AnimalType, animaltype => animaltype.type_id)
  @JoinColumn({ name: 'animaltype_type_id' })
  animaltype!: AnimalType;
}