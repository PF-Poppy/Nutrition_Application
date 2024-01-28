import { Router } from "express";
import AdminHomeController from "../controllers/adminhome.controller";
import authJwt from "../middleware/authJwt";

class AdminHomeRoutes {
  router = Router();
  controller = new AdminHomeController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/totalAmount",[authJwt.validateToken, authJwt.isAdmin],this.controller.getAdminHome);
  }
}

export default new AdminHomeRoutes().router;