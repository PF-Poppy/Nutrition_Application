import { Router } from 'express';
import UserRoleController from '../controllers/userrole.controller';
import authJwt from '../middleware/authJwt';

class UserRoleRoutes {
    router = Router();
    controller = new UserRoleController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post("/add-new-first-time", this.controller.createUserRolefirsttime);
        //TODO ทดสอบ
        this.router.get("/getRolesForUser/:username", this.controller.getUserRolesByName);
    }
}

export default new UserRoleRoutes().router;