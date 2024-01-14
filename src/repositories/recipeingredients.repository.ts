import { Recipeingredients } from "../entity/recipeingredients.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "RecipeIngredients Repositor";

interface IRecipeIngredientsRepository {
    save(recipeIngredients: Recipeingredients): Promise<Recipeingredients>;
    retrieveById(recipeIngredientId: string): Promise<Recipeingredients | undefined>;
    deleteById(recipeIngredientId: string): Promise<number>;
    deleteAll(): Promise<number>;
}

class RecipeIngredientsRepository implements IRecipeIngredientsRepository {
    async save(recipeIngredients: Recipeingredients): Promise<Recipeingredients> {
        try {
            const connect = AppDataSource.getRepository(Recipeingredients);
            const duplicate = await connect.findOne(
                { where: { ingredients_ingredient_id: recipeIngredients.ingredients_ingredient_id, petrecipes_recipes_id: recipeIngredients.petrecipes_recipes_id } }
            );
            if (duplicate) {
                logging.error(NAMESPACE, "Duplicate recipe ingredients.");
                throw 'Duplicate recipe ingredients.';
            }

            const result = await connect.save(recipeIngredients);
            logging.info(NAMESPACE, "Save recipe ingredients successfully.");
            try {
                const res = await this.retrieveById(result.recipe_ingredient_id);
                return res;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveById from insert recipe ingredients');
                throw err;
            }
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(recipeIngredientId: string): Promise<Recipeingredients> {
        try {
            const result = await AppDataSource.getRepository(Recipeingredients).findOne({
                where : { recipe_ingredient_id: recipeIngredientId },
                select: ["recipe_ingredient_id", "ingredients_ingredient_id", "petrecipes_recipes_id", "quantity"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Recipe ingredients not found.");
                throw 'Recipe ingredients not found.';
            }
            logging.info(NAMESPACE, "Retrieve recipe ingredients successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(recipeIngredientId: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Recipeingredients);
            const result = await connect.delete({ recipe_ingredient_id: recipeIngredientId });
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Recipe ingredients not found.");
                return 0;
            }
            logging.info(NAMESPACE, "Delete recipe ingredients successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Recipeingredients);
            const result = await connect.delete({});
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Recipe ingredients not found.");
                return 0;
            }
            logging.info(NAMESPACE, "Delete recipe ingredients successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new RecipeIngredientsRepository();