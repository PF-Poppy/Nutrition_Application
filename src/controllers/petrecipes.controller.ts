import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Petrecipes } from "../entity/petrecipes.entity";
import { Recipeingredients } from "../entity/recipeingredients.entity";
import { Recipenutrition } from "../entity/recipesnutrition.entity";
import { NutritionSummary } from "../config/type";
import petrecipesRepository from "../repositories/petrecipes.repository";
import recipeingredientsRepository from "../repositories/recipeingredients.repository";
import nutritionRepository from "../repositories/nutrition.repository";
import recipenutritionRepository from "../repositories/recipesnutrition.repository";
import diseaseRepository from "../repositories/disease.repository";
import diseasenutritionRepository from "../repositories/diseasenutrition.repository";
import petRepository from "../repositories/pet.repository";
import logging from "../config/logging";

const NAMESPACE = "PetRecipes Controller";

export default class PetRecipesController {
    async getPetsRecipes(req: Request, res: Response) {
        logging.info(NAMESPACE, "Get all pets recipes");
        if (!req.body) {
            res.status(400).json({
                message: "Content cannot be empty",
            });
            return;
        }
        const { petId, petName, recipeType, selectedIngredientList } = req.body; ;
        if (!petId || !petName || !recipeType || !selectedIngredientList) {
            res.status(400).json({
                message: "Please fill in all the fields!",
            });
            return;
        }
        try {
            const pettype = await petRepository.retrieveById(petId);
            const disease = await diseaseRepository.retrieveByPetId(petId);
            const nutritionSummary: NutritionSummary = {};

            const chronicDisease = await Promise.all(disease.map(async (diseaseInfo) => {
                const diseaseDetail = await diseasenutritionRepository.retrieveByDiseaseId(diseaseInfo.diseasedetailid);
        
                diseaseDetail.forEach(diseaseNutritionInfo => {
                    const nutritionName = diseaseNutritionInfo.nutrient_name;
                    const nutritionValueMin = diseaseNutritionInfo.value_min;
                    const nutritionValueMax = diseaseNutritionInfo.value_max;
        
                    if (!nutritionSummary[nutritionName]) {
                        nutritionSummary[nutritionName] = {
                            minValue_intersect: nutritionValueMin,
                            maxValue_intersect: nutritionValueMax,
                        };
                    } else {
                        nutritionSummary[nutritionName].minValue_intersect = Math.max(nutritionSummary[nutritionName].minValue_intersect, nutritionValueMin);
                        nutritionSummary[nutritionName].maxValue_intersect = Math.min(nutritionSummary[nutritionName].maxValue_intersect, nutritionValueMax);
                    }
                });

                return {
                    petChronicDiseaseId: diseaseInfo.diseasedetailid,
                    petChronicDiseaseName: diseaseInfo.diseasename,
                    diseaseNutrition: diseaseDetail.map(diseaseNutritionInfo => ({
                        diseaseNutritionId: diseaseNutritionInfo.nutrition_id,
                        diseaseNutritionName: diseaseNutritionInfo.nutrient_name,
                        diseaseNutritionmin: diseaseNutritionInfo.value_min,
                        diseaseNutritionmax: diseaseNutritionInfo.value_max,
                    })),
                };
            }));
        
            const sortedChronicDisease = chronicDisease.sort((a, b) => a.petChronicDiseaseId.localeCompare(b.petChronicDiseaseId));

            const petrecipes = await petrecipesRepository.retrieveByPetTypeId(pettype.animaltypeid);
            const petrecipesList = await Promise.all(petrecipes.map(async (petrecipesInfo) => {
                const recipeingredients = await recipeingredientsRepository.retrieveByRecipeId(petrecipesInfo.recipes_id);
                const recipenutrition = await recipenutritionRepository.retrieveByRecipeId(petrecipesInfo.recipes_id);

                const recipeIngredientList = recipeingredients.map(recipeIngredientInfo => ({
                    recipeingredientsId: recipeIngredientInfo.recipe_ingredient_id,
                    ingredientId: recipeIngredientInfo.ingredient_id,
                    ingredientName: recipeIngredientInfo.ingredient_name,
                    amount: recipeIngredientInfo.quantity,
                }));
                //TODO เปลี่ยนชื่อคำว่า น้ำเป็นชื่ออื่นตามที่บันทึกดใน database
                const waterNutrition = recipenutrition.find(recipeNutritionInfo => recipeNutritionInfo.nutrient_name === "น้ำ");
                //console.log(waterNutrition.nutrient_value);
                const recipeNutritionList = recipenutrition.map(recipeNutritionInfo => ({
                    recipenutritionId: recipeNutritionInfo.recipes_nutrition_id,
                    nutritionId: recipeNutritionInfo.nutrition_id,
                    nutritionName: recipeNutritionInfo.nutrient_name,
                    amount: recipeNutritionInfo.nutrient_value,
                }));
                const sortedrecipeIngrediente = recipeIngredientList.sort((a, b) => a.recipeingredientsId.localeCompare(b.recipeingredientsId));
                const sortedrecipeNutrition = recipeNutritionList.sort((a, b) => a.recipenutritionId.localeCompare(b.recipenutritionId));

                return {
                    recipeId: petrecipesInfo.recipes_id,
                    recipeName: petrecipesInfo.recipes_name,
                    sortedrecipeIngrediente,
                    recipeNutritionList,
                }
            }));
            //TODO แก้คำ ตอนนี้ algorithmA === เอาสูตรอาหารเท่าที่มีวัตถุดิบตรงตามที่เลือกไว้
            //geneticAlgorithm === ต้องมีวัตถุดิบอย่างน้อยที่เลือกมา จะมีอันอื่นเพิ่มมาก็ได้
            let recipesList: any = [];
            const countSelectedIngredient = selectedIngredientList.length;
            const sortedSelectedIngredient = selectedIngredientList.sort(((a:any, b:any) => a.ingredientId.localeCompare(b.ingredientId)));
            if (recipeType == "algorithmA") {
                const recipes = petrecipesList
                .filter(petrecipesInfo => petrecipesInfo.sortedrecipeIngrediente.length === countSelectedIngredient)
                .map(filteredRecipe => {
                    return filteredRecipe;
                });
                recipesList = recipes.filter(recipe => {
                    return recipe.sortedrecipeIngrediente.every(recipeIngredien => {
                        return sortedSelectedIngredient.some((selectedIngredient:any) => {
                            return recipeIngredien.ingredientId === selectedIngredient.ingredientId;
                        });
                    });
                });
            }else if (recipeType == "geneticAlgorithm") {
                const recipes = petrecipesList
                .filter(petrecipesInfo => petrecipesInfo.sortedrecipeIngrediente.length >= countSelectedIngredient)
                .map(filteredRecipe => {
                    return filteredRecipe;
                });
                recipesList = recipes.filter(recipe =>
                    selectedIngredientList.every((selectedIngredient:any) =>
                        recipe.sortedrecipeIngrediente.some(recipeIngredient =>
                            recipeIngredient.ingredientId === selectedIngredient.ingredientId
                        )
                    ) &&
                    selectedIngredientList.every((selectedIngredient:any) =>
                        recipe.sortedrecipeIngrediente.some(recipeIngredient =>
                            selectedIngredientList.some((selectedIngredient:any) =>
                                recipeIngredient.ingredientId === selectedIngredient.ingredientId
                            )
                        )
                    )
                );
            }
            
            res.status(200).send({
                petrecipesList: petrecipesList,
                recipesList,
                nutritionSummary
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: "Some error occurred while get pet recipes."
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

            petrecipes.recipenutrition = await Promise.all(freshNutrientList.map(async (nutrientInfoData: any) => {
                if (!nutrientInfoData.nutrientName || !nutrientInfoData.amount) {
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const nutrient = await nutritionRepository.retrieveByName(nutrientInfoData.nutrientName);

                    const recipenutrition = new Recipenutrition();
                    recipenutrition.nutrition_nutrition_id = nutrient.nutrition_id;
                    recipenutrition.petrecipes_recipes_id = recipeId;
                    recipenutrition.nutrient_value = nutrientInfoData.amount;
                    recipenutrition.update_by = `${userid}_${username}`;
                    recipenutrition.update_date = new Date();
                    const addNewRecipeNutrient = await recipenutritionRepository.update(recipenutrition);
                }catch (err) {
                    throw err;
                }
                return;
            }));
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