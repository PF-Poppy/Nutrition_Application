import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Petrecipes } from "../entity/petrecipes.entity";
import { Recipeingredients } from "../entity/recipeingredients.entity";
import { Recipenutrition } from "../entity/recipesnutrition.entity";
import petrecipesRepository from "../repositories/petrecipes.repository";
import recipeingredientsRepository from "../repositories/recipeingredients.repository";
import nutritionRepository from "../repositories/nutrition.repository";
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
        const { recipeId, recipeName, petTypeId, petTypeName, ingredientInRecipeList, freshNutrientList } = req.body;
        if (!recipeId || !recipeName || !petTypeId || !petTypeName || !ingredientInRecipeList || !freshNutrientList) {
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

            petrecipes.recipenutrition = await Promise.all(freshNutrientList.map(async (nutrientInfoData: any) => {
                if (!nutrientInfoData.nutrientName || !nutrientInfoData.amount) {
                    await petrecipesRepository.deleteById(addNewPetRecipe.recipes_id);
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const nutrient = await nutritionRepository.retrieveByName(nutrientInfoData.nutrientName);

                    const recipenutrition = new Recipenutrition();
                    recipenutrition.nutrition_nutrition_id = nutrient.nutrition_id;
                    recipenutrition.petrecipes_recipes_id = addNewPetRecipe.recipes_id;
                    recipenutrition.nutrient_value = nutrientInfoData.amount;
                    recipenutrition.create_by = `${userid}_${username}`;
                    recipenutrition.update_by = `${userid}_${username}`;
                    recipenutrition.update_date = new Date();
                    const addNewRecipeNutrient = await recipenutritionRepository.save(recipenutrition);
                }catch (err) {
                    await petrecipesRepository.deleteById(addNewPetRecipe.recipes_id);
                    throw err;
                }
                return;
            }));
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
                    message: "Some error occurred while creating animal."
                });
                return;
            }
        }
    }
}
/*
{
	"recipeId" : "123",
	"recipeName" : "สูตร123…",
	“petTypeId” : “123”,
	“petTypeName” : “สุนัข”,
	“ingredientInRecipeList” : [
        {
            “ingredeintId” : “123”,
            “ingredientName” : “หมู”,
            “amount” : 20.00
        }
	
    ]
    “freshNutrientList” : [
        {
	        “nutrientName” : “โปรตีน”,
	        “amount” : 20.00
        }
    ]
}*/