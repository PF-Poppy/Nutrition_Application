import { Application } from "express";
import animalRoutes from "./animal.routes";
import petRoutes from "./pet.routes";
import defaultRoutes from "./default.routes";
import authRoutes from "./auth.routes";

export default class Routes {
    constructor(app: Application) {
        app.use('/', defaultRoutes);
        app.use('/api/auth', authRoutes);
        app.use('/api/animals', animalRoutes);
        app.use('/api/pets', petRoutes);
    }
}