import { Router } from 'express';
import PetController from '../controllers/pet.controller';
import authJwt from '../middleware/authJwt';

class PetRoutes {
    router = Router();
    controller = new PetController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/',[authJwt.validateToken] ,this.controller.getPetProfile);
        this.router.post('/add-new',[authJwt.validateToken] ,this.controller.addNewPet);
        this.router.put('/update',[authJwt.validateToken] ,this.controller.updatePet);
        this.router.delete('/delete/:petProfileId',[authJwt.validateToken] ,this.controller.deletePet);
    }
}

export default new PetRoutes().router;