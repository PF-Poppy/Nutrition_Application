import { Router } from 'express';
import RoleController from '../controllers/role.controller';
import authJwt from '../middleware/authJwt';

class RoleRoutes {
    router = Router();
    controller = new RoleController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get("/", [authJwt.validateToken, authJwt.isUserManagementAdmin], this.controller.getAllRole);
        this.router.post("/add-new", [authJwt.validateToken, authJwt.isUserManagementAdmin], this.controller.addNewRole);
        this.router.put("/update", [authJwt.validateToken, authJwt.isUserManagementAdmin], this.controller.updateRole);
        this.router.delete("/delete/:roleID", [authJwt.validateToken, authJwt.isUserManagementAdmin], this.controller.deleteRole);
    }
}

export default new RoleRoutes().router;