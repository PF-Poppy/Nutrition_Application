import { Recipeingredients } from "../entity/recipeingredients.entity";
import { Ingredients } from "../entity/ingredients.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "RecipeIngredients Repositor";

interface IRecipeIngredientsRepository {
    save(recipeIngredients: Recipeingredients): Promise<Recipeingredients>;
    update(recipeIngredients: Recipeingredients): Promise<Recipeingredients>;
    retrieveById(recipeIngredientId: string): Promise<Recipeingredients | undefined>;
    retrieveByRecipeId(recipeId: string): Promise<any[]>;
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

    async update(recipeIngredients: Recipeingredients): Promise<Recipeingredients> {
        let result: Recipeingredients | undefined;
        try {
            const connect = AppDataSource.getRepository(Recipeingredients);
            const existingData = await connect.findOne({
                where: { ingredients_ingredient_id: recipeIngredients.ingredients_ingredient_id, petrecipes_recipes_id: recipeIngredients.petrecipes_recipes_id }
            });

            if (!existingData) {
                recipeIngredients.create_by = `${recipeIngredients.update_by}`;
                try {
                    const res = await this.save(recipeIngredients);
                    logging.info(NAMESPACE, "Insert new recipe ingredients successfully.");

                    try {
                        result = await this.retrieveById(res.recipe_ingredient_id);
                        return result;
                    }catch (err) {
                        logging.error(NAMESPACE, 'Error call retrieveById from insert recipe ingredients');
                        throw err;
                    }
                }catch (err) {
                    logging.error(NAMESPACE, 'Error save new recipe ingredients');
                    throw err;
                }
            }else {
                await connect.update({ recipe_ingredient_id: existingData.recipe_ingredient_id }, recipeIngredients);
                logging.info(NAMESPACE, "Update recipe ingredients successfully.");

                try {
                    result = await this.retrieveById(existingData.recipe_ingredient_id);
                    return result;
                }catch (err) {
                    logging.error(NAMESPACE, 'Error call retrieveById from update recipe ingredients');
                    throw err;
                }
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

    async retrieveByRecipeId(recipeId: string): Promise<any[]> {
        try {
            const result = await AppDataSource.getRepository(Recipeingredients)
            .createQueryBuilder("recipeingredients")
            .innerJoinAndSelect(Ingredients, "ingredients", "ingredients.ingredient_id = recipeingredients.ingredients_ingredient_id")
            .select([
                "recipeingredients.recipe_ingredient_id AS recipe_ingredient_id",
                "recipeingredients.ingredients_ingredient_id AS ingredients_ingredient_id",
                "recipeingredients.petrecipes_recipes_id AS petrecipes_recipes_id",
                "recipeingredients.quantity AS quantity",
                "ingredients.ingredient_id AS ingredient_id",
                "ingredients.ingredient_name AS ingredient_name",
            ])
            .where("recipeingredients.petrecipes_recipes_id = :recipeId", { recipeId: recipeId })
            .getRawMany();
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