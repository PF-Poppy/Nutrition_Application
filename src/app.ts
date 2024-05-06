import express, {Application} from 'express';
import morgan from 'morgan';
import Routes from './routes/index.routes';
import cors, { CorsOptions } from "cors";
import logging from './config/logging';
import {AppDataSource} from './db/data-source';
import bodyParser from 'body-parser';
import 'reflect-metadata';

const NAMESPACE = 'Server';

export  class App{
    
    private app : Application;

    constructor(private port ?: number | string){
        this.app = express();
        this.settings();
        this.middlewares();
        this.initializeRoutes();
    }
    
    async initializeApp() {
        try {
            await AppDataSource.initialize();
            logging.info(NAMESPACE, 'Successfully connected to the database.');
            this.listen();
        } catch (error) {
            logging.error(NAMESPACE, 'Error connecting to the database:', error);
            process.exit(1);
        }
    }

    settings(){
        this.app.set('port', this.port || process.env.PORT || 3000);
    }

    middlewares(){
        //TODO แก้
        const corsOptions: CorsOptions = {
           origin: ["http://localhost:3000","http://10.3.133.119:3000"],
           methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
           optionsSuccessStatus: 200
        };

        this.app.use(morgan('dev'));
        this.app.use(express.json());
        this.app.use(cors(corsOptions));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    initializeRoutes() {
        new Routes(this.app);
    }

    listen() {
        this.app.listen(this.app.get('port'), () => {
            logging.info(NAMESPACE, `Server on port ${this.app.get('port')}`);
        });
    }

}
