import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import authJwt from '../middleware/authJwt';


class AuthenRoutes {
    router = Router();
    controller = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/test', authJwt.validateToken); //TODO ลบ
        this.router.post('/register', this.controller.signup);
        this.router.post('/login', this.controller.signin);
    }
}

export default new AuthenRoutes().router;