import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Ingredients } from '../entity/ingredients.entity';
import { Ingredientnutritionprimary } from '../entity/ingredientnutritionprimary.entity';
import { Nutritionprimary } from '../entity/nutritionprimary.entity';
import ingredientsRepository from '../repositories/ingredients.repository';
import ingredientnutritionRepository from '../repositories/ingredientnutrition.repository';
import nutritionprimaryRepository from '../repositories/nutritionprimary.repository';
import logging from '../config/logging';

const NAMESPACE = 'Ingredient Controller';

export default class IngredientController {
    async addNewIngredient(req: Request, res: Response){
        logging.info(NAMESPACE, 'Add new ingredientnutrition');
        console.log(req.body);
        const { userid, username } = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).json({
                message: 'Content can not be empty!'
            });
            return;
        }
        const { ingredientName, nutrient} = req.body;
        if (!ingredientName || !nutrient) {
            res.status(400).json({
                message: "Please fill in all the fields!"
            });
            return;
        }
        try {
            const ingredient = new Ingredients();
            ingredient.ingredient_name = ingredientName;
            ingredient.create_by = `${userid}_${username}`;
            ingredient.update_date = new Date();
            ingredient.update_by = `${userid}_${username}`;
            const addingredient = await ingredientsRepository.save(ingredient);
            
            let order_value: number = 0;
            ingredient.ingredientnutritionprimary = [];
            for (const nutrientInfoData of nutrient) {
                if (!nutrientInfoData.nutrientName || nutrientInfoData.amount == undefined) {
                    await ingredientsRepository.deleteById(addingredient.ingredient_id);
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const nutrient = await nutritionprimaryRepository.retrieveByName(nutrientInfoData.nutrientName);
                    const nutrientorder_value = new Nutritionprimary();
                    nutrientorder_value.order_value = order_value;
                    nutrientorder_value.nutrient_name = nutrientInfoData.nutrientName;
                    await nutritionprimaryRepository.updatenutritionorder_value(nutrientorder_value);
                    order_value++;

                    const nutrientInfo = new Ingredientnutritionprimary();
                    nutrientInfo.nutritionprimary_nutrition_id = nutrient.nutrition_id;
                    nutrientInfo.ingredients_ingredient_id = addingredient.ingredient_id;
                    nutrientInfo.nutrient_value = nutrientInfoData.amount;
                    nutrientInfo.create_by = `${userid}_${username}`;
                    nutrientInfo.update_date = new Date();
                    nutrientInfo.update_by = `${userid}_${username}`;

                    try {
                        const addnewngredientnutrition = await ingredientnutritionRepository.save(nutrientInfo);
                        ingredient.ingredientnutritionprimary.push(addnewngredientnutrition);
                    }catch(err){
                        throw err;
                    }
                }catch(err){
                    await ingredientsRepository.deleteById(addingredient.ingredient_id);
                    throw err;
                }
            }
            logging.info(NAMESPACE, 'Add new ingredient successfully');
            return res.status(200).json({
                message: 'Add new ingredient successfully'
            });
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            if ( (err as Error).message === "Please fill in all the fields!" ) {
                res.status(400).json({
                    message: (err as Error).message
                });
                return;
            }else {
                res.status(500).json({
                    message: "Some error occurred while creating ingredient."
                });
                return;
            }
        }
    }

    async updateIngredient(req: Request, res: Response){
        logging.info(NAMESPACE, 'Update ingredientnutrition');
        const { userid, username } = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).json({
                message: 'Content can not be empty!'
            });
            return;
        }
        const { ingredientId, ingredientName, nutrient} = req.body;
        if ( ingredientId === "" || ingredientId === undefined || ingredientId === null) {
            res.status(400).json({
                message: 'Ingredient Id can not be empty!'
            });
            return;
        }
        if (!ingredientName || !nutrient) {
            res.status(400).json({
                message: "Please fill in all the fields!"
            });
            return;
        }

        try {
            const ingredient = await ingredientsRepository.retrieveById(ingredientId);
        }catch(err){
            res.status(404).json( {
                message: `Not found ingredient with id=${ingredientId}.`
            });
            return;
        }
        
        try {
            const ingredient = new Ingredients();
            ingredient.ingredient_id = ingredientId;
            ingredient.ingredient_name = ingredientName;
            ingredient.update_date = new Date();
            ingredient.update_by = `${userid}_${username}`;
            const updateingredient = await ingredientsRepository.update(ingredient);

            await Promise.all(nutrient.map(async (nutrientInfoData: any) => {
                if (!nutrientInfoData.nutrientName || nutrientInfoData.amount == undefined) {
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const nutrient = await nutritionprimaryRepository.retrieveByName(nutrientInfoData.nutrientName);
                }catch(err){
                    throw err;
                }
            }));

            let order_value: number = 0;
            ingredient.ingredientnutritionprimary = [];
            for (const nutrientInfoData of nutrient) {
                try {
                    const nutrients = await nutritionprimaryRepository.retrieveByName(nutrientInfoData.nutrientName);
                    const nutrientorder_value = new Nutritionprimary();
                    nutrientorder_value.order_value = order_value;
                    nutrientorder_value.nutrient_name = nutrientInfoData.nutrientName;
                    await nutritionprimaryRepository.updatenutritionorder_value(nutrientorder_value);
                    order_value++;

                    const nutrientInfo = new Ingredientnutritionprimary();
                    nutrientInfo.nutritionprimary_nutrition_id = nutrients.nutrition_id;
                    nutrientInfo.ingredients_ingredient_id = ingredientId;
                    nutrientInfo.nutrient_value = nutrientInfoData.amount;
                    nutrientInfo.update_by = `${userid}_${username}`;
                    nutrientInfo.update_date = new Date();

                    const updateingredientnutrition = await ingredientnutritionRepository.update(nutrientInfo);
                    ingredient.ingredientnutritionprimary.push(updateingredientnutrition);
                }catch(err){
                    throw err;
                }
            }
            logging.info(NAMESPACE, 'Update ingredient successfully');
            return res.status(200).json({
                message: 'Update ingredient successfully'
            });
        }catch(err){
            if ( (err as Error).message === "Please fill in all the fields!" ) {
                res.status(400).json({
                    message: (err as Error).message
                });
                return;
            }else {
                res.status(500).json({
                    message: "Some error occurred while creating ingredient."
                });
                return;
            }
        }
    }

    async getAllIngredient(req: Request, res: Response){
        logging.info(NAMESPACE, 'Get all ingredientnutrition');
        try {
            const ingredient = await ingredientsRepository.retrieveAll();

            const result = await Promise.all(ingredient.map(async (ingredientInfo: Ingredients) => {
                const ingredientnutrition = await ingredientnutritionRepository.retrieveByIngredientId(ingredientInfo.ingredient_id);
                const sortingredientnutrition = ingredientnutrition.sort((a, b) => a.order_value - b.order_value);

                const nutrientlimitinfo = await Promise.all(sortingredientnutrition.map(async (ingredientnutritionInfo: any) => {
                    return {
                        nutrientName: ingredientnutritionInfo.nutrient_name,
                        unit: ingredientnutritionInfo.nutrient_unit,    
                        amount: ingredientnutritionInfo.nutrient_value
                    }
                }));
                return {
                        ingredientId: ingredientInfo.ingredient_id,
                        ingredientName: ingredientInfo.ingredient_name,
                        nutrient: nutrientlimitinfo
                };
            }));
            logging.info(NAMESPACE, 'Get all ingredientnutrition successfully');
            res.status(200).json(result);
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            return res.status(500).json({
                message: 'Error while getting all ingredientnutrition'
            });
        }
    }

    async deleleIngredient(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Delete ingredientnutrition');
        if (req.params.ingredientId == ":ingredientId" || !req.params.ingredientId) {
            res.status(400).json({
                message: 'Ingredient Id can not be empty!'
            });
            return;
        }
        const ingredientId: string = req.params.ingredientId;
        
        try {
            const ingredient = await ingredientsRepository.retrieveById(ingredientId);
        }catch(err){
            res.status(404).json( {
                message: `Not found ingredient with id=${ingredientId}.`
            });
            return;
        }

        try {
            try {
                await ingredientsRepository.deleteById(ingredientId);
            }catch (err) {
                logging.error(NAMESPACE, (err as Error).message, err);
                return res.status(500).json({
                    message: 'Error while deleting ingredientnutrition'
                });
            }
            logging.info(NAMESPACE, 'Delete ingredientnutrition successfully');
            return res.status(200).json({
                message: 'Delete ingredientnutrition successfully'
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            return res.status(500).json({
                message: 'Error while deleting ingredientnutrition'
            });
        }
        
    }
}