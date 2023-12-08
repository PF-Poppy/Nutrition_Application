import "reflect-metadata";
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, BeforeInsert, Not, IsNull} from 'typeorm';
import { AppDataSource } from "../db/data-source";
import { Ingredientnutrition } from './ingredientnutrition.entity';
import { Recipeingredients } from "./recipeingredients.entity";
//import { Ingredienttypes } from './ingredienttypes.entity';

@Entity({ name: "ingredients" })
export class Ingredients {
  @PrimaryColumn()
  ingredient_id!: string

  @Column({type: "varchar", length: 255})
  ingredient_name!: string

  //มีตารางแต่ตอนนี้ยังไม่ใช้
  //@Column()
  //ingredienttypes_ingredienttypes_id!: number

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @OneToMany(() => Ingredientnutrition, ingredientnutrition => ingredientnutrition.ingredients_ingredient_id)
  ingredientnutrition?: Ingredientnutrition[];

  @OneToMany(() => Recipeingredients, recipeingredients => recipeingredients.ingredients_ingredient_id)
  recipeingredients?: Recipeingredients[];

  //@ManyToOne(() => Ingredienttypes, ingredienttypes => ingredienttypes.ingredienttypes_id)
  //@JoinColumn({ name: "ingredienttypes_ingredienttypes_id" })
  //ingredienttypes!: Ingredienttypes;

  @BeforeInsert()
  async generateIngredientId() {
    const lastEntity = await AppDataSource.getRepository(Ingredients).findOne({ 
      where: { ingredient_id: Not(IsNull()) },
      order: { ingredient_id : 'DESC' } 
    });

    let newId = 'INGRED0001';
    if (lastEntity) {
      const lastId = lastEntity.ingredient_id;
      const lastNumber = parseInt(lastId.slice(6), 10);
      const numberOfDigits = lastId.length - 'INGRED'.length;
      const nextNumber = lastNumber + 1;
      newId = `INGRED${nextNumber.toString().padStart(numberOfDigits, '0')}`;
    }

    this.ingredient_id = newId;
  }
}