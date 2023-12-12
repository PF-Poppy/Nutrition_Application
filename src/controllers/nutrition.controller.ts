import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Nutrition } from "../entity/nutrition.entity";
import nutritionRepository from "../repositories/nutrition.repository";
import healthnutritionRepository from "../repositories/healthnutrition.repository";
import ingredientnutritionRepository from "../repositories/ingredientnutrition.repository";
import logging from "../config/logging";

const NAMESPACE = "Nutrition Controller";

export default class NutritionController {
    async getAllNutrition(req: Request, res: Response) {
        logging.info(NAMESPACE, "Get all nutrition");
        try {
            const nutrient = await nutritionRepository.retrieveAll();
            const result = await Promise.all(nutrient.map(async (nutrientData: any) => {
                return {
                    nutritionID: nutrientData.nutrition_id.toString(),
                    nutrientName: nutrientData.nutrient_name
                };
            }));
            logging.info(NAMESPACE, "Get all nutrition successfully.");
            res.status(200).send(result);
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: err
            });
        }
    }

    async addNewNutrition(req: Request, res: Response) {
        logging.info(NAMESPACE, "Add new nutrition");
        const { userid, username} = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).send({
                message: "Content can not be empty!"
            });
        }
        const { nutrientName } = req.body;
        try {
            const nutrition = new Nutrition();
            nutrition.nutrient_name = nutrientName;
            nutrition.create_by = `${userid}_${username}`;
            nutrition.update_by = `${userid}_${username}`;
            nutrition.create_date = new Date();
            const addnutrition = await nutritionRepository.save(nutrition);
            logging.info(NAMESPACE, "Add new nutrition successfully.");
            res.status(200).send({
                message: "Add new nutrition successfully.",
            })
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: err
            });
        }
    }

    async updateNutrition(req: Request, res: Response) {
        logging.info(NAMESPACE, "Update nutrition");
        const { userid, username} = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).send({
                message: "Content can not be empty!"
            });
            return;
        }
        const { nutritionID, nutrientName } = req.body;
        if (nutritionID == "" || nutritionID == null || nutritionID == undefined) {
            res.status(400).send({
                message: "Nutrition ID can not be empty!"
            });
            return;
        }
        try {
            const nutrient = new Nutrition();
            nutrient.nutrition_id = parseInt(nutritionID);
            nutrient.nutrient_name = nutrientName;
            nutrient.update_by = `${userid}_${username}`;
            nutrient.update_date = new Date();
            const updatenutrition = await nutritionRepository.update(nutrient);
            logging.info(NAMESPACE, "Update nutrition successfully.");
            res.status(200).send({
                message: "Update nutrition successfully.",
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: err
            });
        }
    }

    async deleteNutrition(req: Request, res: Response) {
        logging.info(NAMESPACE, "Delete nutrition");
        if (req.params.nutritionID == ":nutritionID" || !req.params.nutritionID) {
            res.status(400).send({
                message: "Nutrition ID can not be empty!"
            });
            return;
        }
        const nutritionID:number = parseInt(req.params.nutritionID);

        try {
            await healthnutritionRepository.deleteByNutritionID(nutritionID);
            await ingredientnutritionRepository.deleteByNutritionID(nutritionID);
            await nutritionRepository.deleteByID(nutritionID);
            logging.info(NAMESPACE, "Delete nutrition successfully.");
            res.status(200).send({
                message: "Delete nutrition successfully.",
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: err
            });
        }
    }
}