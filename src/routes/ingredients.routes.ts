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
        this.router.get('/',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin], this.controller.getAllIngredient);
        this.router.post('/add-new',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin], this.controller.addNewIngredient);
        this.router.put('/update',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin],this.controller.updateIngredient)
        this.router.delete('/delete/:ingredientId',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin],this.controller.deleleIngredient)
    }

}

export default new IngredientRoutes().router;