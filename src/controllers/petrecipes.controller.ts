import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Petrecipes } from "../entity/petrecipes.entity";
import { Recipeingredients } from "../entity/recipeingredients.entity";
import { Recipenutrition } from "../entity/recipenutrition.entity";
import { Nutritionsecondary } from "../entity/nutritionsecondary.entity";
import petrecipesRepository from "../repositories/petrecipes.repository";
import recipeingredientsRepository from "../repositories/recipeingredients.repository";
import nutritionsecondaryRepository from "../repositories/nutritionsecondary.repository";
import recipenutritionRepository from "../repositories/recipesnutrition.repository";
import ingredientnutritionRepository from "../repositories/ingredientnutrition.repository";
import animaltypeRepository from "../repositories/animaltype.repository";
import logging from "../config/logging";

const NAMESPACE = "PetRecipes Controller";

export default class PetRecipesController {
    async getAllPetRecipes(req: Request, res: Response) {
        logging.info(NAMESPACE, "Get all pet recipes");
        try {
            const petrecipes = await petrecipesRepository.retrieveAll();

            const petrecipesList = await Promise.all(petrecipes.map(async (petrecipe: any) => {
                const pettype = await animaltypeRepository.retrieveById(petrecipe.animaltype_type_id);
                const recipeingredients = await recipeingredientsRepository.retrieveByRecipeId(petrecipe.recipes_id);
                const recipenutrition = await recipenutritionRepository.retrieveByRecipeId(petrecipe.recipes_id);
                const sortedrecipeNutrition = recipenutrition.sort((a: any, b: any) => a.order_value - b.order_value);

                const recipeIngredientList = await Promise.all(recipeingredients.map(async recipeingredient => {
                    const ingredientNutritionInfo = await ingredientnutritionRepository.retrieveByIngredientId(recipeingredient.ingredient_id);
                    const sortedingredientNutrition = ingredientNutritionInfo.sort((a: any, b: any) => a.order_value - b.order_value);
                    const ingredientNutritionList = sortedingredientNutrition.map(ingredientNutritionInfo => ({
                        nutrientName: ingredientNutritionInfo.nutrient_name,
                        unit: ingredientNutritionInfo.nutrient_unit,
                        amount: ingredientNutritionInfo.nutrient_value,
                    }));
                    return { 
                        ingredient:{
                            ingredientId: recipeingredient.ingredient_id,
                            ingredientName: recipeingredient.ingredient_name,
                            nutrient: ingredientNutritionList,
                        },
                        amount: recipeingredient.quantity,
                    }
                }));

                const nutritionList = sortedrecipeNutrition.map(recipeNutritionInfo => ({
                    nutrientName: recipeNutritionInfo.nutrient_name,
                    unit: recipeNutritionInfo.nutrient_unit,
                    amount: recipeNutritionInfo.nutrient_value,
                }));

                const sortedrecipeIngrediente = recipeIngredientList.sort((a:any, b:any) => a.ingredient.ingredientId.localeCompare(b.ingredient.ingredientId));
                return {
                    recipeId: petrecipe.recipes_id,
                    recipeName: petrecipe.recipes_name,
                    petTypeId: pettype.type_id,
                    petTypeName: pettype.type_name,
                    ingredientInRecipeList :sortedrecipeIngrediente,
                    freshNutrientList: nutritionList,
                };
            }));

            logging.info(NAMESPACE, "Get all pet recipes successfully.");
            res.status(200).json(petrecipesList);
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
                message: "Some error occurred while retrieving pet recipes."
            });
        }
    }
    async addNewPetRecipe(req: Request, res: Response) {
        logging.info(NAMESPACE, "Add new pet recipe");
        if (!req.body) {
            res.status(400).json({
                message: "Content cannot be empty",
            });
            return;
        }
        const { userid, username} = (req as JwtPayload).jwtPayload;
        /*
        const { recipeName, petTypeId, petTypeName, ingredientInRecipeList, freshNutrientList } = req.body;
        if (!recipeName || !petTypeId || !petTypeName || !ingredientInRecipeList || !freshNutrientList) {
            res.status(400).json({
                message: "Please fill in all the fields!",
            });
            return;
        }
        */
        const { recipeName, petTypeName, ingredientInRecipeList, freshNutrientList } = req.body;
        if (!recipeName  || !petTypeName || !ingredientInRecipeList || !freshNutrientList) {
            res.status(400).json({
                message: "Please fill in all the fields!",
            });
            return;
        }
        try {
            const pettype = await animaltypeRepository.retrieveByName(petTypeName);

            const petrecipes = new Petrecipes();
            petrecipes.recipes_name = recipeName;
            petrecipes.animaltype_type_id = pettype.type_id;
            petrecipes.create_by = `${userid}_${username}`;
            petrecipes.update_by = `${userid}_${username}`;
            petrecipes.update_date = new Date();
            const addNewPetRecipe = await petrecipesRepository.save(petrecipes);

            petrecipes.recipeingredients = await Promise.all(ingredientInRecipeList.map(async (ingredientinfo: any) => {
                if (!ingredientinfo.ingredient || ingredientinfo.amount == undefined) {
                    await petrecipesRepository.deleteById(addNewPetRecipe.recipes_id);
                    throw new Error("Please fill in all the fields!");
                }
                if (!ingredientinfo.ingredient.ingredientId || !ingredientinfo.ingredient.ingredientName) {
                    await petrecipesRepository.deleteById(addNewPetRecipe.recipes_id);
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const recipeingredients = new Recipeingredients();
                    recipeingredients.ingredients_ingredient_id = ingredientinfo.ingredient.ingredientId;
                    recipeingredients.petrecipes_recipes_id = addNewPetRecipe.recipes_id;
                    recipeingredients.quantity = ingredientinfo.amount;
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
                if (!nutrientInfoData.nutrientName || nutrientInfoData.amount == undefined) {
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
            res.status(200).json({
                message: "Add new pet recipe successfully.",
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            if ( (err as Error).message === "Please fill in all the fields!" ) {
                res.status(400).json({
                    message: (err as Error).message
                });
                return;
            }else {
                res.status(500).json({
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
        /*
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
        */
        const { recipeId,recipeName, petTypeName, ingredientInRecipeList, freshNutrientList } = req.body;
        if (recipeId === "" || recipeId === undefined || recipeId === null) {
            res.status(400).json({
                message: "Pet recipe id cannot be empty",
            });
            return;
        }
        if (!recipeName || !petTypeName || !ingredientInRecipeList || !freshNutrientList) {
            res.status(400).json({
                message: "Please fill in all the fields!",
            });
            return;
        }
        try{
            const petrecipes = await petrecipesRepository.retrieveById(recipeId);
        }catch(err){
            res.status(404).json( {
                message: `Not found petrecipes with id=${recipeId}.`
            });
            return;
        }
        try {
            const pettype = await animaltypeRepository.retrieveByName(petTypeName);

            const petrecipes = new Petrecipes();
            petrecipes.recipes_id = recipeId;
            petrecipes.recipes_name = recipeName;
            petrecipes.animaltype_type_id = pettype.type_id;
            petrecipes.update_by = `${userid}_${username}`;
            petrecipes.update_date = new Date();
            const updatePetRecipe = await petrecipesRepository.update(petrecipes);

            petrecipes.recipeingredients = await Promise.all(ingredientInRecipeList.map(async (ingredientinfo: any) => {
                if (!ingredientinfo.ingredient || ingredientinfo.amount == undefined) {
                    throw new Error("Please fill in all the fields!");
                }
                if (!ingredientinfo.ingredient.ingredientId || !ingredientinfo.ingredient.ingredientName) {
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const recipeingredients = new Recipeingredients();
                    recipeingredients.ingredients_ingredient_id = ingredientinfo.ingredient.ingredientId;
                    recipeingredients.petrecipes_recipes_id = recipeId;
                    recipeingredients.quantity = ingredientinfo.amount;
                    recipeingredients.update_by = `${userid}_${username}`;
                    recipeingredients.update_date = new Date();
                    const updateRecipeIngredient = await recipeingredientsRepository.update(recipeingredients);
                }catch (err) {
                    throw err;
                }
            }));

            let order_value: number = 0;
            petrecipes.recipenutrition = [];
            for (const nutrientInfoData of freshNutrientList) {
                if (!nutrientInfoData.nutrientName || nutrientInfoData.amount == undefined) {
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
            res.status(200).json({
                message: "Update pet recipe successfully.",
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            if ( (err as Error).message === "Please fill in all the fields!" ) {
                res.status(400).json({
                    message: (err as Error).message
                });
                return;
            }else {
                res.status(500).json({
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
            res.status(404).json( {
                message: `Not found petrecipes with id=${recipeId}.`
            });
            return;
        }

        try {
            await petrecipesRepository.deleteById(recipeId);
            logging.info(NAMESPACE, "Delete pet recipe successfully.");
            res.status(200).json({
                message: "Delete pet recipe successfully.",
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
                message: "Some error occurred while deleting pet recipe."
            });
            return;
        }
    }
}