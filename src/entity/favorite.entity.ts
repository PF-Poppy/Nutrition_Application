import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Petrecipes } from "./petrecipes.entity";
import { User } from "./user.entity";

@Entity({ name: "favorite" })
export class Favorite {
  @PrimaryGeneratedColumn("uuid")
  favorite_id!: string

  @Column()
  user_user_id!: string

  @Column()
  petrecipes_recipes_id!: string

  @CreateDateColumn()
  create_date?: Date;

  @UpdateDateColumn()
  update_date?: Date;

  @ManyToOne(() => User, user => user.user_id)
  @JoinColumn({ name: 'user_user_id' })
  user!: User;

  @ManyToOne(() => Petrecipes, petrecipes => petrecipes.recipes_id)
  @JoinColumn({ name: 'petrecipes_recipes_id' })
  petrecipes!: Petrecipes;
}