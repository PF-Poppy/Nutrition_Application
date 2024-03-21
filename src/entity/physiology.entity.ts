import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import { AnimalType } from "./animaltype.entity";
import { Nutrientsrequirement } from "./nutrientsrequirement.entity";

@Entity({ name: "physiology" })
export class Physiology {
  @PrimaryGeneratedColumn("uuid")
  physiology_id!: string

  @Column({type: "varchar", length: 255})
  physiology_name!: string

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

  @OneToMany(() => Nutrientsrequirement, nutrientsrequirement => nutrientsrequirement.physiology.physiology_id)
  nutrientsrequirement?: Nutrientsrequirement[];
}