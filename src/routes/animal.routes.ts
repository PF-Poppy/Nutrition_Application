//TODO แก้
import { Router } from 'express';
import AnimalController from '../controllers/animal.controller';
import authJwt from '../middleware/authJwt';

class AnimalRoutes {
    router = Router();
    controller = new AnimalController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/',[authJwt.validateToken], this.controller.getAllAnimalType);
        this.router.post('/add-new',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin], this.controller.addNewAnimalType);
    }
}

export default new AnimalRoutes().router;


