import { Application } from "express";
import animalRoutes from "./animaltype.routes";
import petRoutes from "./pet.routes";
import ingredientRoutes from "./ingredients.routes";
import defaultRoutes from "./default.routes";
import authRoutes from "./auth.routes";
import nutritionRoutes from "./nutrition.routes";
import roleRoutes from "./role.routes";

export default class Routes {
    constructor(app: Application) {
        app.use('/', defaultRoutes);
        app.use('/api/auth', authRoutes);
        app.use('/api/animaltype', animalRoutes);
        app.use('/api/pets', petRoutes);
        app.use('/api/ingredients', ingredientRoutes);
        app.use('/api/nutrition', nutritionRoutes);
        app.use('/api/role', roleRoutes);
    }
}