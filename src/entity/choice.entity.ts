import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Questions } from "./questions.entity";


@Entity({ name: "choices" })
export class Choices {
  @PrimaryGeneratedColumn()
  choice_id!: number

  @Column({type: "varchar", length: 255})
  choice_text!: string

  @Column()
  questions_question_id!: number

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @ManyToOne(() => Questions, questions => questions.question_id,{ onDelete: 'CASCADE' ,cascade: true })
  @JoinColumn({ name: 'questions_question_id' })
  questions!: Questions;
}