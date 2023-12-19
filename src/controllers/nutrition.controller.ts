import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Nutrition } from "../entity/nutrition.entity";
import nutritionRepository from "../repositories/nutrition.repository";
import diseasenutritionRepository from "../repositories/diseasenutrition.repository";
import ingredientnutritionRepository from "../repositories/ingredientnutrition.repository";
import logging from "../config/logging";

const NAMESPACE = "Nutrition Controller";

export default class NutritionController {
    async getAllNutrition(req: Request, res: Response) {
        logging.info(NAMESPACE, "Get all nutrition");
        try {
            const nutrient = await nutritionRepository.retrieveAll();
            const result = await Promise.all(nutrient.map(async (nutrientData: Nutrition) => {
                return {
                    nutritionId: nutrientData.nutrition_id,
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
        const { nutrientName } = req.body;
        if(!nutrientName) {
            res.status(400).send({
                message: "Please fill in all the fields!"
            });
            return;
        }
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
                message: 'Content can not be empty!'
            });
            return;
        }
        const { nutritionId, nutrientName } = req.body;
        if (nutritionId == "" || nutritionId == null || nutritionId == undefined) {
            res.status(400).send({
                message: "Nutrition Id can not be empty!"
            });
            return;
        }
        if (!nutrientName) {
            res.status(400).send({
                message: "Please fill in all the fields!"
            });
            return;
        }
        try {
            const nutrient = new Nutrition();
            nutrient.nutrition_id = nutritionId;
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
        if (req.params.nutritionId == ":nutritionId" || !req.params.nutritionId) {
            res.status(400).send({
                message: "Nutrition Id can not be empty!"
            });
            return;
        }
        const nutritionId:string = req.params.nutritionId;

        try {
            await diseasenutritionRepository.deleteByNutritionId(nutritionId);
            await ingredientnutritionRepository.deleteByNutritionId(nutritionId);
            await nutritionRepository.deleteById(nutritionId);
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