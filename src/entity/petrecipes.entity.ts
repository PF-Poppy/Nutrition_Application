import "reflect-metadata";
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert, Not, IsNull, ManyToOne, JoinColumn} from 'typeorm';
import { AppDataSource } from "../db/data-source";
import { Favorite } from "./favorite.entity";
import { AnimalType } from "./animaltype.entity";
import { Recipeingredients } from "./recipeingredients.entity";

@Entity({ name: "petrecipes" })
export class Petrecipes {
  @PrimaryColumn()
  recipes_id!: string

  @Column()
  animaltype_type_id!: number

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

  @BeforeInsert()
  async generateRecipeIngredientId() {
    const lastEntity = await AppDataSource.getRepository(Petrecipes).findOne({
      where: { recipes_id: Not(IsNull()) },
      order: { recipes_id: 'DESC' } 
    });

    let newId = 'RECIEPES0001';
    if (lastEntity) {
      const lastId = lastEntity.recipes_id;
      const lastNumber = parseInt(lastId.slice(8), 10);
      const numberOfDigits = lastId.length - 'RECIEPES'.length;
      const nextNumber = lastNumber + 1;
      newId = `RECIEPES${nextNumber.toString().padStart(numberOfDigits, '0')}`;
    }

    this.recipes_id = newId;
  }
}