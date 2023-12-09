import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Ingredients } from '../entity/ingredients.entity';
import { Ingredientnutrition } from '../entity/ingredientnutrition.entity';
import ingredientsRepository from '../repositories/ingredients.repository';
import ingredientnutritionRepository from '../repositories/ingredientnutrition.repository';
import nutritionRepository from '../repositories/nutrition.repository';
import logging from '../config/logging';

const NAMESPACE = 'Ingredient Controller';

export default class IngredientController {
    async addNewIngredient(req: Request, res: Response){
        logging.info(NAMESPACE, 'Add new ingredientnutrition');
        const { userid, username } = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).send({
                message: 'Content can not be empty!'
            });
            return;
        }
        const { ingredientName, nutrient} = req.body;
        try {
            const ingredient = new Ingredients();
            ingredient.ingredient_name = ingredientName;
            ingredient.create_by = `${userid}_${username}`;
            ingredient.update_date = new Date();
            ingredient.update_by = `${userid}_${username}`;
            ingredient.generateIngredientId();
            const addingredient = await ingredientsRepository.save(ingredient);
            
            ingredient.ingredientnutrition = await Promise.all(nutrient.map(async (nutrientInfoData: any) => {
                const nutrient = await nutritionRepository.retrieveByName(nutrientInfoData.nutrientName);
                if (nutrient === null || nutrient === undefined) {
                    await ingredientsRepository.deleteByID(addingredient.ingredient_id);
                    throw new Error("Not found nutrient with name: " + nutrientInfoData.nutrientName);
                }
                const nutrientInfo = new Ingredientnutrition();
                nutrientInfo.nutrition_nutrition_id = nutrient.nutrition_id;
                nutrientInfo.ingredients_ingredient_id = addingredient.ingredient_id;
                nutrientInfo.nutrient_value = nutrientInfoData.amount;
                nutrientInfo.create_by = `${userid}_${username}`;
                nutrientInfo.update_date = new Date();
                nutrientInfo.update_by = `${userid}_${username}`;
                try {
                    const addnewngredientnutrition = await ingredientnutritionRepository.save(nutrientInfo);
                    return;
                }catch(err){
                    await ingredientsRepository.deleteByID(addingredient.ingredient_id);
                    throw err;
                }
            }));
            logging.info(NAMESPACE, 'Add new ingredientnutrition successfully');
            return res.status(200).send({
                message: 'Add new ingredientnutrition successfully'
            });
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            return res.status(500).send({
                message: 'Error while adding ingredientnutrition'
            });
        }
    }

    async updateIngredient(req: Request, res: Response){
        logging.info(NAMESPACE, 'Update ingredientnutrition');
        const { userid, username } = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).send({
                message: 'Content can not be empty!'
            });
            return;
        }
        const { ingredientID, ingredientName, nutrient} = req.body;
        if ( ingredientID === "" || ingredientID === undefined || ingredientID === null) {
            res.status(400).send({
                message: 'Ingredient ID can not be empty!'
            });
            return;
        }
        try {
            const ingredient = new Ingredients();
            ingredient.ingredient_id = ingredientID;
            ingredient.ingredient_name = ingredientName;
            ingredient.update_date = new Date();
            ingredient.update_by = `${userid}_${username}`;
            const updateingredient = await ingredientsRepository.update(ingredient);

            ingredient.ingredientnutrition = await Promise.all(nutrient.map(async (nutrientInfoData: any) => {
                const nutrient = await nutritionRepository.retrieveByName(nutrientInfoData.nutrientName);
                if (nutrient === null || nutrient === undefined) {
                    throw new Error("Not found nutrient with name: " + nutrientInfoData.nutrientName);
                }
                const nutrientInfo = new Ingredientnutrition();
                nutrientInfo.nutrition_nutrition_id = nutrient.nutrition_id;
                nutrientInfo.ingredients_ingredient_id = updateingredient.ingredient_id;
                nutrientInfo.nutrient_value = nutrientInfoData.amount;
                nutrientInfo.update_by = `${userid}_${username}`;
                nutrientInfo.update_date = new Date();
                try {
                    const updateingredientnutrition = await ingredientnutritionRepository.update(nutrientInfo);
                    return;
                }catch(err) {
                    throw err;
                }
            }));
            logging.info(NAMESPACE, 'Update ingredientnutrition successfully');
            return res.status(200).send({
                message: 'Update ingredientnutrition successfully'
            });
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            return res.status(500).send({
                message: 'Error while updating ingredientnutrition'
            });
        }
    }

    async getAllIngredient(req: Request, res: Response){
        logging.info(NAMESPACE, 'Get all ingredientnutrition');
        try {
            const ingredient = await ingredientsRepository.retrieveAll();

            const result = await Promise.all(ingredient.map(async (ingredientInfo: any) => {
                const ingredientnutrition = await ingredientnutritionRepository.retrieveByIngredientID(ingredientInfo.ingredient_id);

                const nutrientlimitinfo = await Promise.all(ingredientnutrition.map(async (ingredientnutritionInfo: any) => {
                    return {
                        nutrientName: ingredientnutritionInfo.nutrient_name,
                        amount: ingredientnutritionInfo.nutrient_value
                    }
                }));
                return {
                    ingredientID: ingredientInfo.ingredient_id,
                    ingredientName: ingredientInfo.ingredient_name,
                    nutrient: nutrientlimitinfo
                };
            }));
            logging.info(NAMESPACE, 'Get all ingredientnutrition successfully');
            res.status(200).send(result);
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            return res.status(500).send({
                message: 'Error while getting all ingredientnutrition'
            });
        }
    }

    async deleleIngredient(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Delete ingredientnutrition');
        console.log(req.params.ingredientID)
        if (req.params.ingredientID == ":ingredientID" || !req.params.ingredientID) {
            res.status(400).send({
                message: 'Ingredient ID can not be empty!'
            });
            return;
        }
        const ingredientid: string = req.params.ingredientID;

        try {
            const ingredient = await ingredientsRepository.retrieveByID(ingredientid);
            if (!ingredient) {
                res.status(404).send( {
                    message: `Not found ingredient with id=${ingredient}.`
                });
                return;
            }

            try {
                await ingredientnutritionRepository.deleteByIngredientID(ingredientid);
                await ingredientsRepository.deleteByID(ingredientid);
            }catch (err) {
                logging.error(NAMESPACE, (err as Error).message, err);
                return res.status(500).send({
                    message: 'Error while deleting ingredientnutrition'
                });
            }
            logging.info(NAMESPACE, 'Delete ingredientnutrition successfully');
            return res.status(200).send({
                message: 'Delete ingredientnutrition successfully'
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            return res.status(500).send({
                message: 'Error while deleting ingredientnutrition'
            });
        }
        
    }
}