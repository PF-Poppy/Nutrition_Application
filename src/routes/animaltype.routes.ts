import { Router } from 'express';
import AnimalController from '../controllers/animaltype.controller';
import authJwt from '../middleware/authJwt';

class AnimalRoutes {
    router = Router();
    controller = new AnimalController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/user-allAnimalType',[authJwt.validateToken], this.controller.getAllAnimalTypeForNormalUser);
        this.router.get('/admin-allAnimalType',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin], this.controller.getAllAnimalType);
        this.router.post('/add-new',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin], this.controller.addNewAnimalType);
        this.router.put('/update',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin],this.controller.updateAnimalType)
        this.router.delete('/delete/:petTypeInfoId',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin],this.controller.deleteAnimalType)
    }
}

export default new AnimalRoutes().router;


