import { Router } from 'express';
import { getDefault } from '../controllers/default.controller';


class DefaultRoutes {
    router = Router();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/', getDefault);
    }
}

export default new DefaultRoutes().router;
