//TODO แก้
import { Router } from 'express';
import PetController from '../controllers/pet.controller';
import authJwt from '../middleware/authJwt';

class AnimalRoutes {
    router = Router();
    controller = new PetController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post('/add-new',[authJwt.validateToken] ,this.controller.addNewPet);
    }
}

export default new AnimalRoutes().router;