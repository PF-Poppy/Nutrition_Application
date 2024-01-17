import { Request, Response } from "express";
import { NutritionSummary } from "../config/type";
import petrecipesRepository from "../repositories/petrecipes.repository";
import recipeingredientsRepository from "../repositories/recipeingredients.repository";
import recipenutritionRepository from "../repositories/recipesnutrition.repository";
import diseaseRepository from "../repositories/disease.repository";
import diseasenutritionRepository from "../repositories/diseasenutrition.repository";
import petRepository from "../repositories/pet.repository";
import logging from "../config/logging";

const NAMESPACE = "SearchPetRecipes Controller";

export default class SearchPetRecipesController {
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
                const diseasenutrition = await diseasenutritionRepository.retrieveByDiseaseId(diseaseInfo.diseasedetailid);
        
                diseasenutrition.forEach(diseaseNutritionInfo => {
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
                const sorteddiseasenutrition = diseasenutrition.sort((a, b) => a.nutrition_id.localeCompare(b.nutrition_id));
                return {
                    petChronicDiseaseId: diseaseInfo.diseasedetailid,
                    petChronicDiseaseName: diseaseInfo.diseasename,
                    diseaseNutrition: sorteddiseasenutrition.map(diseaseNutritionInfo => ({
                        diseaseNutritionId: diseaseNutritionInfo.nutrition_id,
                        diseaseNutritionName: diseaseNutritionInfo.nutrient_name,
                        diseaseNutritionmin: diseaseNutritionInfo.value_min,
                        diseaseNutritionmax: diseaseNutritionInfo.value_max,
                    })),
                };
            }));

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
                //TODO เปลี่ยนชื่อคำว่า น้ำเป็นชื่ออื่นตามที่บันทึกดใน database หรือไม่ก็ต้องใช้ น้ำรวมที่เกิดจากการบวกน้ำของแต่ละวัตถุดิบ
                const waterNutrition = recipenutrition.find(recipeNutritionInfo => recipeNutritionInfo.nutrient_name === "น้ำ");
                const recipeNutritionList = recipenutrition.map(recipeNutritionInfo => {
                    if (recipeNutritionInfo.nutrient_name === "น้ำ") {
                        return {
                            recipenutritionId: recipeNutritionInfo.recipes_nutrition_id,
                            nutritionId: recipeNutritionInfo.nutrition_id,
                            nutritionName: recipeNutritionInfo.nutrient_name,
                            amount: recipeNutritionInfo.nutrient_value,
                        };
                    }else {
                        const newAmont = (100 * recipeNutritionInfo.nutrient_value) / (100 - waterNutrition.nutrient_value);
                        return {
                            recipenutritionId: recipeNutritionInfo.recipes_nutrition_id,
                            nutritionId: recipeNutritionInfo.nutrition_id,
                            nutritionName: recipeNutritionInfo.nutrient_name,
                            amount: newAmont,
                        };
                    }
                });
                const sortedrecipeIngrediente = recipeIngredientList.sort((a, b) => a.ingredientId.localeCompare(b.ingredientId));
                const sortedrecipeNutrition = recipeNutritionList.sort((a, b) => a.nutritionId.localeCompare(b.nutritionId));

                return {
                    recipeId: petrecipesInfo.recipes_id,
                    recipeName: petrecipesInfo.recipes_name,
                    sortedrecipeIngrediente,
                    sortedrecipeNutrition,
                }
            }));
            //TODO แก้คำ ตอนนี้ algorithmA === เอาสูตรอาหารเท่าที่มีวัตถุดิบตรงตามที่เลือกไว้
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
            //TODO ยังไม่แน่ใจว่าต้องมีการเปรียบเทียบน้ำไหม
            const filteredRecipes  = recipesList.filter((recipe:any) => {
                const recipeNutritionList = recipe.sortedrecipeNutrition.every((recipeNutrition:any) => {
                    const { nutritionName, amount } = recipeNutrition;
                    const summary = nutritionSummary[nutritionName];
                    if (!summary) {
                        return false;
                    }
                    /*
                    if (nutritionName === "น้ำ") {
                        return amount >= 0 && amount <= 100;
                    }
                    */
                    const { minValue_intersect, maxValue_intersect } = summary;

                    return minValue_intersect <= amount && amount <= maxValue_intersect;
                });
                return recipeNutritionList;
            });
            //TODO มาตกลงว่าจะให้ส่งอะไรกลับไป
            logging.info(NAMESPACE, "Get all pets recipes success");
            res.status(200).send({
                recipesList,
                filteredRecipes,
                nutritionSummary
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: "Some error occurred while get pet recipes."
            });
        }
    }

    async getPetRecipesAlgorithm(req: Request, res: Response) {
        logging.info(NAMESPACE, "Get all pets recipes algorithm");
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
                const diseasenutrition = await diseasenutritionRepository.retrieveByDiseaseId(diseaseInfo.diseasedetailid);
                const sorteddiseasenutrition = diseasenutrition.sort((a, b) => a.nutrition_id.localeCompare(b.nutrition_id));
                
                sorteddiseasenutrition.forEach(diseaseNutritionInfo => {
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
                    diseaseNutrition: sorteddiseasenutrition.map(diseaseNutritionInfo => ({
                        diseaseNutritionId: diseaseNutritionInfo.nutrition_id,
                        diseaseNutritionName: diseaseNutritionInfo.nutrient_name,
                        diseaseNutritionmin: diseaseNutritionInfo.value_min,
                        diseaseNutritionmax: diseaseNutritionInfo.value_max,
                    })),
                };
            }));
            //TODO แก้คำที่จะเป็น input ใหม่
            const limit = [
                {
                    "name": "limitmin",
                    ...Object.entries(nutritionSummary).reduce((acc, [nutrient, values]) => {
                    acc[nutrient] = values.minValue_intersect;
                    return acc;
                    }, {} as Record<string, number>),
                },
                {
                    "name": "limitmax",
                    ...Object.entries(nutritionSummary).reduce((acc, [nutrient, values]) => {
                    acc[nutrient] = values.maxValue_intersect;
                    return acc;
                    }, {} as Record<string, number>),
                },
                {
                    "name": "limitmean",
                    ...Object.entries(nutritionSummary).reduce((acc, [nutrient, values]) => {
                    acc[nutrient] = (values.minValue_intersect+values.maxValue_intersect)/2;
                    return acc;
                    }, {} as Record<string, number>),
                },
            ];
            
            logging.info(NAMESPACE, "Get all pets recipes algorithm success");
            res.status(200).send({
                nutritionSummary,
                limit,
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: "Some error occurred while get pet recipes."
            });
        }
    }
}