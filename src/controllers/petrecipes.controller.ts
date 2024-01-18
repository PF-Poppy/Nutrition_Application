import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Petrecipes } from "../entity/petrecipes.entity";
import { Recipeingredients } from "../entity/recipeingredients.entity";
import { Recipenutrition } from "../entity/recipesnutrition.entity";
import { Nutritionsecondary } from "../entity/nutritionsecondary.entity";
import petrecipesRepository from "../repositories/petrecipes.repository";
import recipeingredientsRepository from "../repositories/recipeingredients.repository";
import nutritionsecondaryRepository from "../repositories/nutritionsecondary.repository";
import recipenutritionRepository from "../repositories/recipesnutrition.repository";
import logging from "../config/logging";


const NAMESPACE = "PetRecipes Controller";

export default class PetRecipesController {
    async addNewPetRecipe(req: Request, res: Response) {
        logging.info(NAMESPACE, "Add new pet recipe");
        if (!req.body) {
            res.status(400).json({
                message: "Content cannot be empty",
            });
            return;
        }
        const { userid, username} = (req as JwtPayload).jwtPayload;
        const { recipeName, petTypeId, petTypeName, ingredientInRecipeList, freshNutrientList } = req.body;
        if (!recipeName || !petTypeId || !petTypeName || !ingredientInRecipeList || !freshNutrientList) {
            res.status(400).json({
                message: "Please fill in all the fields!",
            });
            return;
        }
        try {
            const petrecipes = new Petrecipes();
            petrecipes.recipes_name = recipeName;
            petrecipes.animaltype_type_id = petTypeId;
            petrecipes.create_by = `${userid}_${username}`;
            petrecipes.update_by = `${userid}_${username}`;
            petrecipes.update_date = new Date();
            const addNewPetRecipe = await petrecipesRepository.save(petrecipes);

            petrecipes.recipeingredients = await Promise.all(ingredientInRecipeList.map(async (ingredient: any) => {
                if (!ingredient.ingredeintId || !ingredient.ingredientName || !ingredient.amount) {
                    await petrecipesRepository.deleteById(addNewPetRecipe.recipes_id);
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const recipeingredients = new Recipeingredients();
                    recipeingredients.ingredients_ingredient_id = ingredient.ingredeintId;
                    recipeingredients.petrecipes_recipes_id = addNewPetRecipe.recipes_id;
                    recipeingredients.quantity = ingredient.amount;
                    recipeingredients.create_by = `${userid}_${username}`;
                    recipeingredients.update_by = `${userid}_${username}`;
                    recipeingredients.update_date = new Date();
                    const addNewRecipeIngredient = await recipeingredientsRepository.save(recipeingredients);
                }catch (err) {
                    await petrecipesRepository.deleteById(addNewPetRecipe.recipes_id);
                    throw err;
                }
                return;
            }));
            
            let order_value: number = 0;
            petrecipes.recipenutrition = [];
            for (const nutrientInfoData of freshNutrientList) {
                if (!nutrientInfoData.nutrientName || !nutrientInfoData.amount) {
                    await petrecipesRepository.deleteById(addNewPetRecipe.recipes_id);
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const nutrient = await nutritionsecondaryRepository.retrieveByName(nutrientInfoData.nutrientName);

                    const nutrientorder_value = new Nutritionsecondary();
                    nutrientorder_value.order_value = order_value;
                    nutrientorder_value.nutrient_name = nutrientInfoData.nutrientName;
                    await nutritionsecondaryRepository.updatenutritionorder_value(nutrientorder_value);
                    order_value++;

                    const recipenutrition = new Recipenutrition();
                    recipenutrition.nutritionsecondary_nutrition_id = nutrient.nutrition_id;
                    recipenutrition.petrecipes_recipes_id = addNewPetRecipe.recipes_id;
                    recipenutrition.nutrient_value = nutrientInfoData.amount;
                    recipenutrition.create_by = `${userid}_${username}`;
                    recipenutrition.update_by = `${userid}_${username}`;
                    recipenutrition.update_date = new Date();
                    const addNewRecipeNutrient = await recipenutritionRepository.save(recipenutrition);
                    petrecipes.recipenutrition.push(addNewRecipeNutrient);
                }catch (err) {
                    await petrecipesRepository.deleteById(addNewPetRecipe.recipes_id);
                    throw err;
                }
            };
            logging.info(NAMESPACE, "Add new pet recipe successfully.");
            res.status(200).send({
                message: "Add new pet recipe successfully.",
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            if ( (err as Error).message === "Please fill in all the fields!" ) {
                res.status(400).send({
                    message: (err as Error).message
                });
                return;
            }else {
                res.status(500).send({
                    message: "Some error occurred while creating pet recipe."
                });
                return;
            }
        }
    }

    async updatePetRecipe(req: Request, res: Response) {
        logging.info(NAMESPACE, "Update pet recipe");
        const { userid, username} = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).json({
                message: "Content cannot be empty",
            });
            return;
        }
        const { recipeId,recipeName, petTypeId, petTypeName, ingredientInRecipeList, freshNutrientList } = req.body;
        if (recipeId === "" || recipeId === undefined || recipeId === null) {
            res.status(400).json({
                message: "Pet recipe id cannot be empty",
            });
            return;
        }
        if (!recipeName || !petTypeId || !petTypeName || !ingredientInRecipeList || !freshNutrientList) {
            res.status(400).json({
                message: "Please fill in all the fields!",
            });
            return;
        }

        try{
            const petrecipes = await petrecipesRepository.retrieveById(recipeId);
        }catch(err){
            res.status(404).send( {
                message: `Not found petrecipes with id=${recipeId}.`
            });
            return;
        }
        
        try {
            const petrecipes = new Petrecipes();
            petrecipes.recipes_id = recipeId;
            petrecipes.recipes_name = recipeName;
            petrecipes.animaltype_type_id = petTypeId;
            petrecipes.update_by = `${userid}_${username}`;
            petrecipes.update_date = new Date();
            const updatePetRecipe = await petrecipesRepository.update(petrecipes);

            petrecipes.recipeingredients = await Promise.all(ingredientInRecipeList.map(async (ingredient: any) => {
                if (!ingredient.ingredeintId || !ingredient.ingredientName || !ingredient.amount) {
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const recipeingredients = new Recipeingredients();
                    recipeingredients.ingredients_ingredient_id = ingredient.ingredeintId;
                    recipeingredients.petrecipes_recipes_id = recipeId;
                    recipeingredients.quantity = ingredient.amount;
                    recipeingredients.update_by = `${userid}_${username}`;
                    recipeingredients.update_date = new Date();
                    const updateRecipeIngredient = await recipeingredientsRepository.update(recipeingredients);
                }catch (err) {
                    throw err;
                }
                return;
            }));

            let order_value: number = 0;
            petrecipes.recipenutrition = [];
            for (const nutrientInfoData of freshNutrientList) {
                if (!nutrientInfoData.nutrientName || !nutrientInfoData.amount) {
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const nutrient = await nutritionsecondaryRepository.retrieveByName(nutrientInfoData.nutrientName);
                    console.log(nutrientInfoData.nutrientName);
                    const nutrientorder_value = new Nutritionsecondary();
                    nutrientorder_value.order_value = order_value;
                    nutrientorder_value.nutrient_name = nutrientInfoData.nutrientName;
                    await nutritionsecondaryRepository.updatenutritionorder_value(nutrientorder_value);
                    order_value++;

                    const recipenutrition = new Recipenutrition();
                    recipenutrition.nutritionsecondary_nutrition_id = nutrient.nutrition_id;
                    recipenutrition.petrecipes_recipes_id = recipeId;
                    recipenutrition.nutrient_value = nutrientInfoData.amount;
                    recipenutrition.update_by = `${userid}_${username}`;
                    recipenutrition.update_date = new Date();
                    const addNewRecipeNutrient = await recipenutritionRepository.update(recipenutrition);
                    petrecipes.recipenutrition.push(addNewRecipeNutrient);
                }catch (err) {
                    throw err;
                }
            };
            logging.info(NAMESPACE, "Update pet recipe successfully.");
            res.status(200).send({
                message: "Update pet recipe successfully.",
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            if ( (err as Error).message === "Please fill in all the fields!" ) {
                res.status(400).send({
                    message: (err as Error).message
                });
                return;
            }else {
                res.status(500).send({
                    message: "Some error occurred while creating pet recipe."
                });
                return;
            }
        }
    }
    
    async deletePetRecipe(req: Request, res: Response) {
        logging.info(NAMESPACE, "Delete pet recipe");
        if (req.params.recipeId == ":recipeId" || !req.params.recipeId) {
            res.status(400).json({
                message: "Pet recipe id cannot be empty",
            });
            return;
        } 
        const recipeId:string = req.params.recipeId;

        try {
            const petrecipes = await petrecipesRepository.retrieveById(recipeId);
        }catch(err){
            res.status(404).send( {
                message: `Not found petrecipes with id=${recipeId}.`
            });
            return;
        }

        try {
            await petrecipesRepository.deleteById(recipeId);
            logging.info(NAMESPACE, "Delete pet recipe successfully.");
            res.status(200).send({
                message: "Delete pet recipe successfully.",
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: "Some error occurred while deleting pet recipe."
            });
            return;
        }
    }
}