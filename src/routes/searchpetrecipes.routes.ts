import { Router } from "express";
import SearchPetRecipesController from "../controllers/searchpetrecipes.controller";

class SearchPetRecipesRoutes {
    router = Router();
    controller = new SearchPetRecipesController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/test',this.controller.testgetPetsRecipes);
        this.router.post('/user-getPetRecipes',this.controller.getPetsRecipesForUser);
        this.router.post('/admin-getPetRecipes',this.controller.getPetsRecipesForAdmin);
        this.router.post('/getPetRecipes/algorithm',this.controller.getPetRecipesAlgorithm);
    }
}

export default new SearchPetRecipesRoutes().router;