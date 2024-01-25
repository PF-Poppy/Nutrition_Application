import { Application } from "express";
import animalRoutes from "./animaltype.routes";
import petRoutes from "./pet.routes";
import ingredientRoutes from "./ingredients.routes";
import defaultRoutes from "./default.routes";
import authRoutes from "./auth.routes";
import nutritionprimaryRoutes from "./nutritionprimary.routes";
import nutritionsecondaryRoutes from "./nutritionsecondary.routes";
import roleRoutes from "./role.routes";
import userroleRoutes from "./userrole.routes";
import petrecipesRoutes from "./petrecipes.routes";
import searchpetrecipesRoutes from "./searchpetrecipes.routes";

export default class Routes {
    constructor(app: Application) {
        app.use('/', defaultRoutes);
        app.use('/api/auth', authRoutes);
        app.use('/api/animalType', animalRoutes);
        app.use('/api/pets', petRoutes);
        app.use('/api/ingredients', ingredientRoutes);
        app.use('/api/nutritionSecondary', nutritionsecondaryRoutes);
        app.use('/api/nutritionPrimary', nutritionprimaryRoutes);
        app.use('/api/role', roleRoutes);
        app.use('/api/userRole', userroleRoutes);
        app.use('/api/petRecipes', petrecipesRoutes);
        app.use('/api/searchPetRecipes', searchpetrecipesRoutes);
    }
}