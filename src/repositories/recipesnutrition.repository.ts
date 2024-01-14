import { Recipenutrition } from "../entity/recipesnutrition.entity";
import { Nutrition } from "../entity/nutrition.entity"; 
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "RecipeNutrition Repositor";

interface IRecipeNutritionRepository {
    save(recipeNutrition: Recipenutrition): Promise<Recipenutrition>;
    retrieveById(recipeNutritionId: string): Promise<Recipenutrition | undefined>;
    deleteById(recipeNutritionId: string): Promise<number>;
    deleteAll(): Promise<number>;
}

class RecipeNutritionRepository implements IRecipeNutritionRepository {
    deleteAll(): Promise<number> {
        throw new Error("Method not implemented.");
    }
    async save(recipeNutrition: Recipenutrition): Promise<Recipenutrition> {
        try {
            const connect = AppDataSource.getRepository(Recipenutrition);
            const duplicate = await connect.findOne(
                { where: { nutrition_nutrition_id: recipeNutrition.nutrition_nutrition_id, petrecipes_recipes_id: recipeNutrition.petrecipes_recipes_id } }
            );
            if (duplicate) {
                logging.error(NAMESPACE, "Duplicate recipe nutrition.");
                throw 'Duplicate recipe nutrition.';
            }

            const result = await connect.save(recipeNutrition);
            logging.info(NAMESPACE, "Save recipe nutrition successfully.");
            try {
                const res = await this.retrieveById(result.recipes_nutrition_id);
                return res;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveById from insert recipe nutrition');
                throw err;
            }
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(recipeNutritionId: string): Promise<Recipenutrition> {
        try {
            const result = await AppDataSource.getRepository(Recipenutrition).findOne({
                where : { recipes_nutrition_id: recipeNutritionId },
                select: ["recipes_nutrition_id", "nutrition_nutrition_id", "petrecipes_recipes_id", "nutrient_value"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Recipe nutrition not found.");
                throw 'Recipe nutrition not found.';
            }
            logging.info(NAMESPACE, "Retrieve recipe nutrition successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(recipeNutritionId: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Recipenutrition);
            const result = await connect.delete({ recipes_nutrition_id: recipeNutritionId });
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Recipe nutrition not found.");
                return 0;
            }
            logging.info(NAMESPACE, "Delete recipe nutrition successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new RecipeNutritionRepository();