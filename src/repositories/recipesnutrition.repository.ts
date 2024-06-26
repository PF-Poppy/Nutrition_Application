import { Recipenutrition } from "../entity/recipenutrition.entity";
import { Nutritionsecondary } from "../entity/nutritionsecondary.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "RecipeNutrition Repositor";

interface IRecipeNutritionRepository {
    save(recipeNutrition: Recipenutrition): Promise<Recipenutrition>;
    update(recipeNutrition: Recipenutrition): Promise<Recipenutrition>;
    retrieveById(recipeNutritionId: string): Promise<Recipenutrition | undefined>;
    retrieveByRecipeId(recipeId: string): Promise<any[]>;
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
                { where: { nutritionsecondary_nutrition_id: recipeNutrition.nutritionsecondary_nutrition_id, petrecipes_recipes_id: recipeNutrition.petrecipes_recipes_id } }
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

    async update(recipeNutrition: Recipenutrition): Promise<Recipenutrition> {
        let result: Recipenutrition | undefined;
        try {
            const connect = AppDataSource.getRepository(Recipenutrition);
            const existingData = await connect.findOne({
                where: { nutritionsecondary_nutrition_id: recipeNutrition.nutritionsecondary_nutrition_id,petrecipes_recipes_id: recipeNutrition.petrecipes_recipes_id  }
            });

            if (!existingData) {
                recipeNutrition.create_by = `${recipeNutrition.update_by}`;
                try {
                    const res = await connect.save(recipeNutrition);
                    logging.info(NAMESPACE, "Save recipe nutrition successfully.");
                    try {
                        result = await this.retrieveById(res.recipes_nutrition_id);
                        return result;
                    }catch (err) {
                        logging.error(NAMESPACE, 'Error call retrieveById from insert recipe nutrition');
                        throw err;
                    }
                }catch (err) {
                    logging.error(NAMESPACE, 'Error save new recipe nutrition');
                    throw err;
                }
            }else {
                await connect.update({ recipes_nutrition_id: existingData.recipes_nutrition_id }, recipeNutrition);
                logging.info(NAMESPACE, "Update recipe nutrition successfully.");
                try {
                    result = await this.retrieveById(existingData.recipes_nutrition_id);
                    return result;
                }catch (err) {
                    logging.error(NAMESPACE, 'Error call retrieveById from update recipe nutrition');
                    throw err;
                }
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
                select: ["recipes_nutrition_id", "nutritionsecondary_nutrition_id", "petrecipes_recipes_id", "nutrient_value"]
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

    async retrieveByRecipeId(recipeId: string): Promise<any[]> {
        try {
            const result = await AppDataSource.getRepository(Recipenutrition)
            .createQueryBuilder("recipenutrition")
            .innerJoinAndSelect(Nutritionsecondary, "nutritionsecondary", "nutritionsecondary.nutrition_id = recipenutrition.nutritionsecondary.nutrition_id")
            .select([
                "recipenutrition.recipes_nutrition_id AS recipes_nutrition_id",
                "recipenutrition.nutritionsecondary.nutrition_id AS nutrition_nutrition_id",
                "recipenutrition.petrecipes_recipes_id AS petrecipes_recipes_id",
                "recipenutrition.nutrient_value AS nutrient_value",
                "nutritionsecondary.nutrition_id AS nutrition_id",
                "nutritionsecondary.order_value AS order_value",
                "nutritionsecondary.nutrient_name AS nutrient_name",
                "nutritionsecondary.nutrient_unit AS nutrient_unit",
            ])
            .where("recipenutrition.petrecipes_recipes_id = :recipeId", { recipeId: recipeId })
            .getRawMany();
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