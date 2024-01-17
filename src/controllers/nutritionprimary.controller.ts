import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Nutritionprimary } from "../entity/nutritionprimary.entity";
import NutritionprimaryRepository from "../repositories/nutritionprimary.repository";
import logging from "../config/logging";

const NAMESPACE = "Nutritionprimary Controller";

export default class NutritionprimaryController {
    async getAllNutrition(req: Request, res: Response) {
        logging.info(NAMESPACE, "Get all nutrition");
        try {
            const nutrient = await NutritionprimaryRepository.retrieveAll();
            const result = await Promise.all(nutrient.map(async (nutrientData: Nutritionprimary) => {
                return {
                    nutritionId: nutrientData.nutrition_id,
                    nutrientName: nutrientData.nutrient_name,
                    unit: nutrientData.nutrient_unit,
                };
            }));
            logging.info(NAMESPACE, "Get all nutrition successfully.");
            res.status(200).send(result);
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: (err as Error).message
            });
        }
    }

    async addNewNutritionfirsttime(req: Request, res: Response) {
        logging.info(NAMESPACE, "Add new nutrition");
        const { nutrientName, unit } = req.body;
        if(!nutrientName) {
            res.status(400).send({
                message: "Please fill in all the fields!"
            });
            return;
        }
        try {
            
            const nutrition = new Nutritionprimary();
            nutrition.nutrient_name = nutrientName;
            nutrition.nutrient_unit = unit;
            nutrition.create_date = new Date();
            const addnutrition = await NutritionprimaryRepository.save(nutrition);
            logging.info(NAMESPACE, "Add new nutrition successfully.");
            res.status(200).send({
                message: "Add new nutrition successfully.",
            })
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: (err as Error).message
            });
        }
    }

    async addNewNutrition(req: Request, res: Response) {
        logging.info(NAMESPACE, "Add new nutrition");
        const { userid, username} = (req as JwtPayload).jwtPayload;
        const { nutrientName, unit } = req.body;
        if(!nutrientName) {
            res.status(400).send({
                message: "Please fill in all the fields!"
            });
            return;
        }
        try {
            
            const nutrition = new Nutritionprimary();
            nutrition.nutrient_name = nutrientName;
            nutrition.nutrient_unit = unit;
            nutrition.create_by = `${userid}_${username}`;
            nutrition.update_by = `${userid}_${username}`;
            nutrition.create_date = new Date();
            const addnutrition = await NutritionprimaryRepository.save(nutrition);
            logging.info(NAMESPACE, "Add new nutrition successfully.");
            res.status(200).send({
                message: "Add new nutrition successfully.",
            })
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: (err as Error).message
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
        const { nutritionId, nutrientName, unit } = req.body;
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
            const nutrient = new Nutritionprimary();
            nutrient.nutrition_id = nutritionId;
            nutrient.nutrient_name = nutrientName;
            nutrient.nutrient_unit = unit;
            nutrient.update_by = `${userid}_${username}`;
            nutrient.update_date = new Date();
            const updatenutrition = await NutritionprimaryRepository.update(nutrient);
            logging.info(NAMESPACE, "Update nutrition successfully.");
            res.status(200).send({
                message: "Update nutrition successfully.",
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: (err as Error).message
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
            const nutrition = await NutritionprimaryRepository.retrieveById(nutritionId);
        }catch(err){
            res.status(404).send( {
                message: `Not found nutrition with id=${nutritionId}.`
            });
            return;
        }

        try {
            await NutritionprimaryRepository.deleteById(nutritionId);
            logging.info(NAMESPACE, "Delete nutrition successfully.");
            res.status(200).send({
                message: "Delete nutrition successfully.",
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: (err as Error).message
            });
        }
    }
}