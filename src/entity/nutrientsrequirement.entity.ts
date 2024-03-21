import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { Nutritionsecondary } from "./nutritionsecondary.entity";
import { Physiology } from "./physiology.entity";

@Entity({ name: "nutrientsrequirement" })
export class Nutrientsrequirement {
  @PrimaryGeneratedColumn("uuid")
  nutrientsrequirement_id!: string

  @Column()
  physiology_physiology_id!: string

  @Column()
  nutritionsecondary_nutrition_id!: string

  @Column({type: "double",default: 0.0})
  value_max! : number

  @Column({type: "double",default: 0.0})
  value_min! : number

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @ManyToOne(() => Physiology, physiology => physiology.physiology_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'physiology_physiology_id' })
  physiology!: Physiology;

  @ManyToOne(() => Nutritionsecondary, nutritionsecondary => nutritionsecondary.nutrition_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'nutritionsecondary_nutrition_id' })
  nutritionsecondary!: Nutritionsecondary;

  
}