import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm';
import { Choices } from "./choice.entity";

@Entity({ name: "questions" })
export class Questions {
  @PrimaryGeneratedColumn()
  question_id!: number

  @Column({type: "varchar", length: 255})
  question_text!: string

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @OneToMany(() => Choices, choices => choices.questions_question_id,{ onDelete: 'CASCADE' ,cascade: true })
  choices?: Choices[];
}