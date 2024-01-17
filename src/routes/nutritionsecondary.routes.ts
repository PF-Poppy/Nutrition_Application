import { Router } from "express";
import NutritionsecondaryController from "../controllers/nutritionsecondary.controller";
import authJwt from "../middleware/authJwt";

class NutritionsecondaryRoutes {
    router = Router();
    controller = new NutritionsecondaryController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/", [authJwt.validateToken, authJwt.isPetFoodManagementAdmin], this.controller.getAllNutrition);
        this.router.post("/add-new-first-time", this.controller.addNewNutritionfirsttime);
        this.router.post("/add-new", [authJwt.validateToken, authJwt.isPetFoodManagementAdmin], this.controller.addNewNutrition);
        this.router.put("/update", [authJwt.validateToken, authJwt.isPetFoodManagementAdmin], this.controller.updateNutrition);
        this.router.delete("/delete/:nutritionId", [authJwt.validateToken, authJwt.isPetFoodManagementAdmin], this.controller.deleteNutrition);
    }
}

export default new NutritionsecondaryRoutes().router;