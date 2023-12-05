import { Router } from "express";
import IngredientController from "../controllers/ingredient.controller";
import authJwt from "../middleware/authJwt";

class IngredientRoutes {
    router = Router();
    controller = new IngredientController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post('/add-new',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin], this.controller.addNewIngredient);
        this.router.put('/update',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin],this.controller.updateIngredient)
    }

}

export default new IngredientRoutes().router;