import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
//import { Ingredients } from "./ingredients.entity";

@Entity({ name: "ingredienttypes" })
export class Ingredienttypes {
  @PrimaryGeneratedColumn("uuid")
  ingredienttypes_id!: string

  @Column({type: "varchar", length: 255})
  ingredienttypes_name!: string

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  //@OneToMany(() => Ingredients, ingredients => ingredients.ingredienttypes_ingredienttypes_id)
  //ingredients?: Ingredients[];
}