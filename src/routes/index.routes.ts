import { Application } from "express";
import animalRoutes from "./animaltype.routes";
import petRoutes from "./pet.routes";
import defaultRoutes from "./default.routes";
import authRoutes from "./auth.routes";

export default class Routes {
    constructor(app: Application) {
        app.use('/', defaultRoutes);
        app.use('/api/auth', authRoutes);
        app.use('/api/animaltype', animalRoutes);
        app.use('/api/pets', petRoutes);
    }
}