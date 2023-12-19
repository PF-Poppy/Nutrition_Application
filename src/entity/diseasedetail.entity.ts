import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn} from 'typeorm';
import { Disease } from "./disease.entity";
import { AnimalType } from "./animaltype.entity";
import { Diseasenutrition } from "./diseasenutrition.entity";


@Entity({ name: "diseasedetail" })
export class Diseasedetail {
  @PrimaryGeneratedColumn("uuid")
  disease_id!: string

  @Column({type: "varchar", length: 255})
  disease_name!: string

  @Column()
  animaltype_type_id!: string

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @OneToMany(() => Disease, disease => disease.diseasedetail_disease_id)
  disease!: Disease[];

  @OneToMany(() => Diseasenutrition, diseasenutrition => diseasenutrition.diseasedetail_disease_id)
  diseasenutrition?: Diseasenutrition[];

  @ManyToOne(() => AnimalType, animaltype => animaltype.type_id)
  @JoinColumn({ name: 'animaltype_type_id' })
  animaltype!: AnimalType;
}