import { Router } from "express";
import NutritionController from "../controllers/nutrition.controller";
import authJwt from "../middleware/authJwt";

class NutritionRoutes {
    router = Router();
    controller = new NutritionController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/", [authJwt.validateToken, authJwt.isPetFoodManagementAdmin], this.controller.getAllNutrition);
        this.router.post("/add-new", [authJwt.validateToken, authJwt.isPetFoodManagementAdmin], this.controller.addNewNutrition);
        this.router.put("/update", [authJwt.validateToken, authJwt.isPetFoodManagementAdmin], this.controller.updateNutrition);
        this.router.delete("/delete/:nutritionId", [authJwt.validateToken, authJwt.isPetFoodManagementAdmin], this.controller.deleteNutrition);
    }
}

export default new NutritionRoutes().router;