import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, VersionColumn} from 'typeorm';
import { Questions } from "./questions.entity";


@Entity({ name: "choices" })
export class Choices {
  @PrimaryGeneratedColumn("uuid")
  choice_id!: string

  @Column({type: "varchar", length: 255})
  choice_text!: string

  @Column()
  questions_question_id!: string

  @CreateDateColumn()
  create_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  create_by?: string

  @UpdateDateColumn()
  update_date?: Date;

  @Column({type: "varchar", length: 255, nullable: true})
  update_by?: string

  @ManyToOne(() => Questions, questions => questions.question_id,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'questions_question_id' })
  questions!: Questions;

  @VersionColumn({default: 0})
  version!: number;
}