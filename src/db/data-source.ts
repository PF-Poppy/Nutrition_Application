import "reflect-metadata";
import { DataSource } from "typeorm"
import dbConfig from '../config/db.config';

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: dbConfig.HOST,
    port: 3306,
    username: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    synchronize: true,
    logging: true,
    insecureAuth: true,
    entities: ["src/entity/*.ts"],
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts'],
});
