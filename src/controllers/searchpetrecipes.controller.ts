import { Request, Response } from "express";
import { NutritionSummary } from "../config/type";
import petrecipesRepository from "../repositories/petrecipes.repository";
import animaltypeRepository from "../repositories/animaltype.repository";
import diseasedetailRepository from "../repositories/diseasedetail.repository";
import recipeingredientsRepository from "../repositories/recipeingredients.repository";
import recipenutritionRepository from "../repositories/recipesnutrition.repository";
//import diseaseRepository from "../repositories/disease.repository";
import diseasenutritionRepository from "../repositories/diseasenutrition.repository";
import ingredientnutritionRepository from "../repositories/ingredientnutrition.repository";
//import petRepository from "../repositories/pet.repository";
import defaultnutritionRepository from "../repositories/defaultnutrition.repository";
import axios from "axios";
import logging from "../config/logging";


const NAMESPACE = "SearchPetRecipes Controller";

export default class SearchPetRecipesController {
    async testgetPetsRecipes(req: Request, res: Response) {
        const defaultNutrientLimitList =  [
            {
                "nutrientName": "Metabolizable energy",
                "unit": "kcal/kg",
                "min": 3500,
                "max": 4500
            },
            {
                "nutrientName": "Moisture",
                "unit": "g/100g",
                "min": 0,
                "max": 999999
            }
        ]

        const petrecipes = {
            "recipeId": "123",
            "recipeName": "TestPetsRecipes",
            "petTypeId": "427d4483-a186-4913-8932-8c4abddd6af6",
            "petTypeName": "Dog",
            "ingredientInRecipeList": [
                {
                    "ingredient": {
                        "ingredientId": "f0fa1315-ffaa-4b20-bc2f-94fee66811fd",
                        "ingredientName": "ข้าวขาว",
                        "nutrient": [
                            {
                                "nutrientName": "Crude protein",
                                "unit": "g/100g",
                                "amount": 3.597680815
                            },
                            {
                                "nutrientName": "Crude fat",
                                "unit": "g/100g",
                                "amount": 0
                            },
                            {
                                "nutrientName": "Crude ash",
                                "unit": "g/100g",
                                "amount": 0.186539607
                            }
                        ]
                    },
                    "amount": 32.021451122065045
                },
                {
                    "ingredient": {
                        "ingredientId": "013d9ab4-4cc4-4694-87d1-994a3c61fdc4",
                        "ingredientName": "เนื้อวัว",
                        "nutrient": [
                            {
                                "nutrientName": "Crude protein",
                                "unit": "g/100g",
                                "amount": 22.7634456597163
                            },
                            {
                                "nutrientName": "Crude fat",
                                "unit": "g/100g",
                                "amount": 2.357155949
                            },
                            {
                                "nutrientName": "Crude ash",
                                "unit": "g/100g",
                                "amount": 0.518971864
                            },
                            {
                                "nutrientName": "Moisture",
                                "unit": "g/100g",
                                "amount": 74.75367443
                            }
                        ]
                    },
                    "amount": 63.246779364619655
                }
            ],
            "freshNutrientList": [
                {
                    "nutrientName": "Metabolizable energy",
                    "unit": "kcal/kg",
                    "amount": 148029.67203634317
                },
                {
                    "nutrientName": "Moisture",
                    "unit": "g/100g",
                    "amount": 66.44264206385769
                },
                {
                    "nutrientName": "Crude protein",
                    "unit": "g/100g",
                    "amount": 1554.9175855888993
                }
            ]
        }
        const amount = 30;
        const searchPetRecipes:any = []
        searchPetRecipes.push(petrecipes);
        const searchPetRecipesList = searchPetRecipes.map((searchPetRecipesInfo:any) => {
            return {
                recipeData:{
                    recipeId: searchPetRecipesInfo.recipeId,
                    recipeName: searchPetRecipesInfo.recipeName,
                    petTypeId: searchPetRecipesInfo.petTypeId,
                    petTypeName: searchPetRecipesInfo.petTypeName,
                    ingredientInRecipeList :searchPetRecipesInfo.ingredientInRecipeList,
                    freshNutrientList: searchPetRecipesInfo.freshNutrientList,
                },
                amount: amount,
            }
        });

        return res.status(200).json({
            defaultNutrientLimitList,
            searchPetRecipesList
        });
    }

    async getPetsRecipes(req: Request, res: Response) {
        console.log(req.body);
        logging.info(NAMESPACE, "Get all pets recipes");
        if (!req.body) {
            res.status(400).json({
                message: "Content cannot be empty",
            });
            return;
        }
        /*
        const { petId, petName, recipeType, selectedIngredientList } = req.body; ;
        if (!petId || !petName || !recipeType || !selectedIngredientList) {
            res.status(400).json({
                message: "Please fill in all the fields!",
            });
            return;
        }

        try {
            const pet = await petRepository.retrieveById(petId);
        }catch(err){
            res.status(404).json({
                message: `Not found pet with id=${petId}.`
            });
            return;
        }
        */
        const { petFactorNumber, selectedType , petWeight, petTypeName, petChronicDiseaseList, selectedIngredientList } = req.body; ;
        if (!petFactorNumber || !petWeight || !selectedType || !petTypeName || !petChronicDiseaseList || !selectedIngredientList) {
            res.status(400).json({
                message: "Please fill in all the fields!",
            });
            return;
        }
        try {
            //const pettype = await petRepository.retrieveById(petId);
            //const disease = await diseaseRepository.retrieveByPetId(petId);
            const DER = (70*(petWeight**0.75))*petFactorNumber;
            const pettype = await animaltypeRepository.retrieveByName(petTypeName);
            const defaultnutrition = await defaultnutritionRepository.retrieveByAnimalId(pettype.type_id);
            const sortdefaultnutrition = defaultnutrition.sort((a, b) => a.order_value - b.order_value);

            const nutritionSummary: NutritionSummary = {};
            sortdefaultnutrition.forEach(nutritionInfo => {
                const nutritionName = nutritionInfo.nutrient_name;
                const nutritionValueMin = nutritionInfo.value_min;
                const nutritionValueMax = nutritionInfo.value_max;
                const nutritionUnit = nutritionInfo.nutrient_unit;

                if (!nutritionSummary[nutritionName]) {
                    nutritionSummary[nutritionName] = {
                        minValue_intersect: nutritionValueMin,
                        maxValue_intersect: nutritionValueMax,
                        unit: nutritionUnit,
                    };
                } else {
                    nutritionSummary[nutritionName].minValue_intersect = Math.max(nutritionSummary[nutritionName].minValue_intersect, nutritionValueMin);
                    nutritionSummary[nutritionName].maxValue_intersect = Math.min(nutritionSummary[nutritionName].maxValue_intersect, nutritionValueMax);
                    const { minValue_intersect, maxValue_intersect } = nutritionSummary[nutritionName];
                    if (nutritionSummary[nutritionName].minValue_intersect > nutritionSummary[nutritionName].maxValue_intersect) {
                        nutritionSummary[nutritionName].minValue_intersect = maxValue_intersect;
                        nutritionSummary[nutritionName].maxValue_intersect = minValue_intersect;
                    }
                }
                return {
                    nutrientName: nutritionInfo.nutrient_name,
                    unit: nutritionInfo.nutrient_unit,
                    min: nutritionInfo.value_min,
                    max: nutritionInfo.value_max,
                }
            });
            const chronicDisease = await Promise.all(petChronicDiseaseList.map(async (diseaseInfo:string) => {
                const disease = await diseasedetailRepository.retrieveByName(diseaseInfo);
                if (disease.animaltype_type_id !== pettype.type_id) {
                    throw new Error("No have disease for this pet type");
                }
                const diseasenutrition = await diseasenutritionRepository.retrieveByDiseaseId(disease.disease_id);
                const sorteddiseasenutrition = diseasenutrition.sort((a, b) => a.order_value - b.order_value);

                sorteddiseasenutrition.forEach(diseaseNutritionInfo => {
                    const nutritionName = diseaseNutritionInfo.nutrient_name;
                    const nutritionValueMin = diseaseNutritionInfo.value_min;
                    const nutritionValueMax = diseaseNutritionInfo.value_max;
                    const nutritionUnit = diseaseNutritionInfo.nutrient_unit;
        
                    if (!nutritionSummary[nutritionName]) {
                        nutritionSummary[nutritionName] = {
                            minValue_intersect: nutritionValueMin,
                            maxValue_intersect: nutritionValueMax,
                            unit: nutritionUnit,
                        };
                    } else {
                        nutritionSummary[nutritionName].minValue_intersect = Math.max(nutritionSummary[nutritionName].minValue_intersect, nutritionValueMin);
                        nutritionSummary[nutritionName].maxValue_intersect = Math.min(nutritionSummary[nutritionName].maxValue_intersect, nutritionValueMax);
                        const { minValue_intersect, maxValue_intersect } = nutritionSummary[nutritionName];
                        if (nutritionSummary[nutritionName].minValue_intersect > nutritionSummary[nutritionName].maxValue_intersect) {
                            nutritionSummary[nutritionName].minValue_intersect = maxValue_intersect;
                            nutritionSummary[nutritionName].maxValue_intersect = minValue_intersect;
                        }
                    }
                });
                
                return {
                    petChronicDiseaseId: disease.disease_id,
                    petChronicDiseaseName: diseaseInfo,
                    diseaseNutrition: sorteddiseasenutrition.map(diseaseNutritionInfo => ({
                        diseaseNutritionId: diseaseNutritionInfo.nutrition_id,
                        diseaseNutrientName: diseaseNutritionInfo.nutrient_name,
                        diseaseNutritionmin: diseaseNutritionInfo.value_min,
                        diseaseNutritionmax: diseaseNutritionInfo.value_max,
                        unit: diseaseNutritionInfo.nutrient_unit,
                    })),
                };
            }));

            const petrecipes = await petrecipesRepository.retrieveByPetTypeId(pettype.type_id);
            const petrecipesList = await Promise.all(petrecipes.map(async (petrecipesInfo) => {
                const recipeingredients = await recipeingredientsRepository.retrieveByRecipeId(petrecipesInfo.recipes_id);
                const recipenutrition = await recipenutritionRepository.retrieveByRecipeId(petrecipesInfo.recipes_id);
                const sortedrecipeNutrition = recipenutrition.sort((a, b) => a.order_value - b.order_value);

                const recipeIngredientList = await Promise.all(recipeingredients.map(async recipeIngredientInfo => {
                    const ingredientNutrition = await ingredientnutritionRepository.retrieveByIngredientId(recipeIngredientInfo.ingredient_id);
                    const sortedingredientNutrition = ingredientNutrition.sort((a, b) => a.order_value - b.order_value);
                    const ingredientNutritionList = sortedingredientNutrition.map(ingredientNutritionInfo => ({
                        nutrientName: ingredientNutritionInfo.nutrient_name,
                        unit: ingredientNutritionInfo.nutrient_unit,
                        amount: ingredientNutritionInfo.nutrient_value,
                    }));
                    return {
                        ingredient:{
                            ingredientId: recipeIngredientInfo.ingredient_id,
                            ingredientName: recipeIngredientInfo.ingredient_name,
                            nutrient: ingredientNutritionList,
                        },
                        amount: recipeIngredientInfo.quantity,
                    }
                }));
                const waterNutrition = recipenutrition.find(recipeNutritionInfo => recipeNutritionInfo.nutrient_name === "Moisture");
                const recipeNutritionList = sortedrecipeNutrition.map(recipeNutritionInfo => {
                    if (recipeNutritionInfo.nutrient_name === "Moisture") {
                        return {
                            nutrientName: recipeNutritionInfo.nutrient_name,
                            unit: recipeNutritionInfo.nutrient_unit,
                            amount: 0,
                        };
                    }else {
                        const newAmont = (100 * recipeNutritionInfo.nutrient_value) / (100 - waterNutrition.nutrient_value);
                        return {
                            nutrientName: recipeNutritionInfo.nutrient_name,
                            unit: recipeNutritionInfo.nutrient_unit,
                            amount: newAmont,
                        };
                    }
                });
                const nutritionList = sortedrecipeNutrition.map(recipeNutritionInfo => {
                    return {
                        nutrientName: recipeNutritionInfo.nutrient_name,
                        unit: recipeNutritionInfo.nutrient_unit,
                        amount: recipeNutritionInfo.nutrient_value,
                    };

                });
                const sortedrecipeIngrediente = recipeIngredientList.sort((a, b) => a.ingredient.ingredientId.localeCompare(b.ingredient.ingredientId));
                return {
                    recipeId: petrecipesInfo.recipes_id,
                    recipeName: petrecipesInfo.recipes_name,
                    petTypeId: pettype.type_id,
                    petTypeName: pettype.type_name,
                    ingredientInRecipeList :sortedrecipeIngrediente,
                    recipeNutritionList,
                    nutritionList,
                }
            }));
            //TODO แก้คำ ตอนนี้ algorithmA === เอาสูตรอาหารเท่าที่มีวัตถุดิบตรงตามที่เลือกไว้
            let recipesList: any = [];
            const countSelectedIngredient = selectedIngredientList.length;
            const sortedSelectedIngredient = selectedIngredientList.sort(((a:any, b:any) => a.ingredientId.localeCompare(b.ingredientId)));
            if (selectedType == 1) {
                const recipes = petrecipesList
                .filter(petrecipesInfo => petrecipesInfo.ingredientInRecipeList.length === countSelectedIngredient)
                .map(filteredRecipe => {
                    return filteredRecipe;
                });
                recipesList = recipes.filter(recipe => {
                    return recipe.ingredientInRecipeList.every(recipeIngredien => {
                        return sortedSelectedIngredient.some((selectedIngredient:any) => {
                            return recipeIngredien.ingredient.ingredientId === selectedIngredient.ingredientId;
                        });
                    });
                });
            }else if (selectedType == 2) {
                const recipes = petrecipesList
                .filter(petrecipesInfo => petrecipesInfo.ingredientInRecipeList.length >= countSelectedIngredient)
                .map(filteredRecipe => {
                    return filteredRecipe;
                });
                recipesList = recipes.filter(recipe =>
                    selectedIngredientList.every((selectedIngredient:any) =>
                        recipe.ingredientInRecipeList.some(recipeIngredient =>
                            recipeIngredient.ingredient.ingredientId === selectedIngredient.ingredientId
                        )
                    ) &&
                    selectedIngredientList.every((selectedIngredient:any) =>
                        recipe.ingredientInRecipeList.some(recipeIngredient =>
                            selectedIngredientList.some((selectedIngredient:any) =>
                                recipeIngredient.ingredient.ingredientId === selectedIngredient.ingredientId
                            )
                        )
                    )
                );
            }
            
            const filteredRecipes  = recipesList.filter((recipe:any) => {
                const recipeNutritionList = recipe.recipeNutritionList.every((recipeNutrition:any) => {
                    const { nutrientName, amount } = recipeNutrition;
                    const summary = nutritionSummary[nutrientName];
                    
                    if (!summary) {
                        return false;
                    }
                    if (nutrientName === "Moisture" || nutrientName === "Price") {
                        return true;
                    }
                    const { minValue_intersect, maxValue_intersect } = summary; 
                    return minValue_intersect <= amount && amount <= maxValue_intersect;    
                });
                return recipeNutritionList;
            });

            const filteredRecipesList = filteredRecipes.map((filteredRecipe:any) => {
                return {
                    recipeData:{
                        recipeId: filteredRecipe.recipeId,
                        recipeName: filteredRecipe.recipeName,
                        petTypeId: filteredRecipe.petTypeId,
                        petTypeName: filteredRecipe.petTypeName,
                        ingredientInRecipeList :filteredRecipe.ingredientInRecipeList,
                        freshNutrientList: filteredRecipe.nutritionList,
                    },
                    amount: DER,
                }
            });
            logging.info(NAMESPACE, "Get all pets recipes success");
            res.status(200).json({
                /*
                defaultNutrientLimitList:sortdefaultnutrition.map((nutrientInfo:any) => ({
                    nutrientName: nutrientInfo.nutrient_name,
                    unit: nutrientInfo.nutrient_unit,
                    min: nutrientInfo.value_min,
                    max: nutrientInfo.value_max,
                }))
                */
                defaultNutrientLimitList:Object.entries(nutritionSummary).map(([nutrientName, values]) => ({
                    nutrientName,
                    unit: values.unit, // Assuming different units for different nutrients
                    min: values.minValue_intersect,
                    max: values.maxValue_intersect
                })),
                searchPetRecipesList: filteredRecipesList,
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            if ((err as Error).message === "No have disease for this pet type") {
                res.status(404).json({
                    message: (err as Error).message,
                });
            }else {
                res.status(500).json({
                    message: "Some error occurred while get pet recipes."
                });
            }
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
        /*
        const { petId, petName, recipeType, selectedIngredientList } = req.body; ;
        if (!petId || !petName || !recipeType || !selectedIngredientList) {
            res.status(400).json({
                message: "Please fill in all the fields!",
            });
            return;
        } 

        try {
            //const pet = await petRepository.retrieveById(petId);
        }catch(err){
            res.status(404).json({
                message: `Not found pet with id=${petId}.`
            });
            return;
        }
        */
        const { petFactorNumber, petWeight, selectedType, petTypeName, petChronicDiseaseList, selectedIngredientList } = req.body; ;
        if (!petFactorNumber || !petWeight || !selectedType || !petTypeName || !petChronicDiseaseList || !selectedIngredientList) {
            res.status(400).json({
                message: "Please fill in all the fields!",
            });
            return;
        }
        try {
            //const pettype = await petRepository.retrieveById(petId);
            //const disease = await diseaseRepository.retrieveByPetId(petId);
            const DER = (70*(petWeight**0.75))*petFactorNumber;
            const pettype = await animaltypeRepository.retrieveByName(petTypeName);
            const defaultnutrition = await defaultnutritionRepository.retrieveByAnimalId(pettype.type_id);
            const sortdefaultnutrition = defaultnutrition.sort((a, b) => a.order_value - b.order_value);
            
            const nutritionSummary: NutritionSummary = {};
            sortdefaultnutrition.forEach(nutritionInfo => {
                const nutritionName = nutritionInfo.nutrient_name;
                const nutritionValueMin = nutritionInfo.value_min;
                const nutritionValueMax = nutritionInfo.value_max;
                const nutritionUnit = nutritionInfo.nutrient_unit;

                if (!nutritionSummary[nutritionName]) {
                    nutritionSummary[nutritionName] = {
                        minValue_intersect: nutritionValueMin,
                        maxValue_intersect: nutritionValueMax,
                        unit: nutritionUnit,
                    };
                } else {
                    nutritionSummary[nutritionName].minValue_intersect = Math.max(nutritionSummary[nutritionName].minValue_intersect, nutritionValueMin);
                    nutritionSummary[nutritionName].maxValue_intersect = Math.min(nutritionSummary[nutritionName].maxValue_intersect, nutritionValueMax);
                    const { minValue_intersect, maxValue_intersect } = nutritionSummary[nutritionName];
                    if (nutritionSummary[nutritionName].minValue_intersect > nutritionSummary[nutritionName].maxValue_intersect) {
                        nutritionSummary[nutritionName].minValue_intersect = maxValue_intersect;
                        nutritionSummary[nutritionName].maxValue_intersect = minValue_intersect;
                    }
                }
            });
            const chronicDisease = await Promise.all(petChronicDiseaseList.map(async (diseaseInfo:any) => {
                const disease = await diseasedetailRepository.retrieveByName(diseaseInfo);
                if (disease.animaltype_type_id !== pettype.type_id) {
                    throw new Error("No have disease for this pet type");
                }
                const diseasenutrition = await diseasenutritionRepository.retrieveByDiseaseId(diseaseInfo.diseasedetailid);
                const sorteddiseasenutrition = diseasenutrition.sort((a, b) => a.order_value - b.order_value);

                sorteddiseasenutrition.forEach(diseaseNutritionInfo => {
                    const nutritionName = diseaseNutritionInfo.nutrient_name;
                    const nutritionValueMin = diseaseNutritionInfo.value_min;
                    const nutritionValueMax = diseaseNutritionInfo.value_max;
                    const nutritionUnit = diseaseNutritionInfo.nutrient_unit;
        
                    if (!nutritionSummary[nutritionName]) {
                        nutritionSummary[nutritionName] = {
                            minValue_intersect: nutritionValueMin,
                            maxValue_intersect: nutritionValueMax,
                            unit: nutritionUnit,
                        };
                    } else {
                        nutritionSummary[nutritionName].minValue_intersect = Math.max(nutritionSummary[nutritionName].minValue_intersect, nutritionValueMin);
                        nutritionSummary[nutritionName].maxValue_intersect = Math.min(nutritionSummary[nutritionName].maxValue_intersect, nutritionValueMax);
                        const { minValue_intersect, maxValue_intersect } = nutritionSummary[nutritionName];
                        if (nutritionSummary[nutritionName].minValue_intersect > nutritionSummary[nutritionName].maxValue_intersect) {
                            nutritionSummary[nutritionName].minValue_intersect = maxValue_intersect;
                            nutritionSummary[nutritionName].maxValue_intersect = minValue_intersect;
                        }
                    }
                });
                return {
                    petChronicDiseaseId: diseaseInfo.diseasedetailid,
                    petChronicDiseaseName: diseaseInfo.diseasename,
                    diseaseNutrition: sorteddiseasenutrition.map(diseaseNutritionInfo => ({
                        diseaseNutritionId: diseaseNutritionInfo.nutrition_id,
                        diseaseNutrientName: diseaseNutritionInfo.nutrient_name,
                        diseaseNutritionmin: diseaseNutritionInfo.value_min,
                        diseaseNutritionmax: diseaseNutritionInfo.value_max,
                    })),
                };
            }));
            
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
            const ingredients = await Promise.all(selectedIngredientList.map(async (IngredientInfo:any) => {
                const ingredientNutrition = await ingredientnutritionRepository.retrieveByIngredientId(IngredientInfo.ingredientId);
                const sortedingredientNutrition = ingredientNutrition.sort((a, b) => a.order_value - b.order_value);
                return {
                    name: IngredientInfo.ingredientName,
                    
                    ...sortedingredientNutrition.reduce((acc, nutrientInfo) => {
                        acc[nutrientInfo.nutrient_name] = nutrientInfo.nutrient_value;
                        return acc;
                    }, {} as Record<string, number>),
                };
            }));  
            try {
                //TODO แก้ url ให้ตรงกับ api ที่เราจะเรียกใช้
                if (selectedType == 1) {
                    
                    const algorithmResponse  = await axios.post('http://127.0.0.1:3000/algorithmA', {
                        "ingredients": ingredients,
                        "limit": limit,
                    });
                    
                    const searchPetRecipesList = await Promise.all((algorithmResponse.data.petrecipes).map(async (recipeInfo:any) => {
                        return {
                            recipeData:{
                                recipeId: "1",
                                recipeName: "petrecipes_algorithmA",
                                petTypeId: pettype.type_id,
                                petTypeName: pettype.type_name,
                                ingredientInRecipeList: await Promise.all(recipeInfo.ingredientList.map(async (ingredientInfo:any) => {
                                    const ingredientNutrition = await ingredientnutritionRepository.retrieveByIngredientId(selectedIngredientList.find((ingredient:any) => ingredient.ingredientName === ingredientInfo.name).ingredientId);
                                    const sortedingredientNutrition = ingredientNutrition.sort((a, b) => a.order_value - b.order_value);
                                    const ingredientNutritionList = sortedingredientNutrition.map(ingredientNutritionInfo => ({
                                        nutrientName: ingredientNutritionInfo.nutrient_name,
                                        unit: ingredientNutritionInfo.nutrient_unit,
                                        amount: ingredientNutritionInfo.nutrient_value,
                                    }));
                                    return {
                                        ingredient:{
                                            ingredientId: selectedIngredientList.find((ingredient:any) => ingredient.ingredientName === ingredientInfo.name).ingredientId,
                                            ingredientName: ingredientInfo.name,
                                            nutrient: ingredientNutritionList,
                                        },
                                        amount: ingredientInfo.amount,
                                    }
                                })),
                                freshNutrientList: sortdefaultnutrition.map((nutrientInfo:any) => ({
                                    nutrientName: nutrientInfo.nutrient_name,
                                    unit: nutrientInfo.nutrient_unit,
                                    amount: (recipeInfo.freshNutrient).find((nutrients:any) => nutrients.nutrientname === nutrientInfo.nutrient_name).amount,
                                })),
                            },
                            amount: DER,
                        }
                    }));

                    res.status(200).json({/*
                        defaultNutrientLimitList:sortdefaultnutrition.map((nutrientInfo:any) => ({
                            nutrientName: nutrientInfo.nutrient_name,
                            unit: nutrientInfo.nutrient_unit,
                            min: nutrientInfo.value_min,
                            max: nutrientInfo.value_max,
                        })),
                        */
                        defaultNutrientLimitList:Object.entries(nutritionSummary).map(([nutrientName, values]) => ({
                            nutrientName,
                            unit: values.unit, // Assuming different units for different nutrients
                            min: values.minValue_intersect,
                            max: values.maxValue_intersect
                        })),
                        searchPetRecipesList,
                    });
                }else if (selectedType == 2) {
                    res.status(200).json({
                        "ingredients": ingredients,
                        "limit": limit,
                    });
                }
            }catch(err){
                throw err;
            }
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            if ((err as Error).message === "No have disease for this pet type") {
                res.status(404).json({
                    message: (err as Error).message,
                });
            }else {
                res.status(500).json({
                    message: "Some error occurred while get pet recipes."
                });
            }
        }
    }
}