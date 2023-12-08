import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn} from 'typeorm';
import { Health } from "./health.entity";
import { AnimalType } from "./animaltype.entity";
import { Healthnutrition } from "./healthnutrition.entity";


@Entity({ name: "healthdetail" })
export class Healthdetail {
  @PrimaryGeneratedColumn()
  health_id!: number

  @Column({type: "varchar", length: 255})
  health_name!: string

  @Column()
  animaltype_type_id!: number

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @OneToMany(() => Health, health => health.healthdetail_health_id)
  health!: Health[];

  @OneToMany(() => Healthnutrition, healthnutrition => healthnutrition.healthdetail_health_id)
  healthnutrition?: Healthnutrition[];

  @ManyToOne(() => AnimalType, animaltype => animaltype.type_id)
  @JoinColumn({ name: 'animaltype_type_id' })
  animaltype!: AnimalType;
}