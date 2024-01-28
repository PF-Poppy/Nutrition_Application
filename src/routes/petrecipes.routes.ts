import { Router } from "express";
import PetRecipesController from "../controllers/petrecipes.controller";
import authJwt from "../middleware/authJwt";

class PetRecipesRoutes {
    router = Router();
    controller = new PetRecipesController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/admin-allPetRecipes', this.controller.getAllPetRecipes);
        this.router.post('/add-new',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin], this.controller.addNewPetRecipe);
        this.router.put('/update',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin],this.controller.updatePetRecipe)
        this.router.delete('/delete/:recipeId',[authJwt.validateToken,authJwt.isPetFoodManagementAdmin],this.controller.deletePetRecipe)
    }
}

export default new PetRecipesRoutes().router;