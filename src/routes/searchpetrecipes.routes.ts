import { Router } from "express";
import SearchPetRecipesController from "../controllers/searchpetrecipes.controller";

class SearchPetRecipesRoutes {
    router = Router();
    controller = new SearchPetRecipesController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/getpetrecipes',this.controller.getPetsRecipes);
        this.router.get('/getpetrecipes/algorithm',this.controller.getPetRecipesAlgorithm);
    }
}

export default new SearchPetRecipesRoutes().router;