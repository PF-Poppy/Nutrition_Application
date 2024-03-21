import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, } from 'typeorm';
import { AnimalType } from "./animaltype.entity";
import { Basenutrition } from "./basenutrition.entity";

@Entity({ name: "baseanimaltype" })
export class Baseanimaltype {
  @PrimaryGeneratedColumn("uuid")
  base_id!: string

  @Column({type: "varchar", length: 255})
  base_name!: string

  @Column()
  animaltype_type_id!: string

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

  @ManyToOne(() => AnimalType, animaltype => animaltype.type_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'animaltype_type_id' })
  animaltype!: AnimalType;

  @OneToMany(() => Basenutrition, basenutrition => basenutrition.baseanimaltype)
  basenutrition?: Basenutrition[];
}