import { Ingredientnutrition } from "../entity/ingredientnutrition.entity";
import { Nutrition } from "../entity/nutrition.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Ingredientnutrition Repository";

interface IIngredientnutritionRepository {
    save(ingredientnutrition:Ingredientnutrition): Promise<Ingredientnutrition>;
    update(ingredientnutrition:Ingredientnutrition): Promise<Ingredientnutrition>; 
    retrieveById(ingredientnutritionid: string): Promise<Ingredientnutrition | undefined>;
    retrieveByIngredientId(ingredientid: string): Promise<any[]>;
    deleteByIngredientId(ingredientid: string): Promise<number>
    deleteByNutritionId(nutritionid: string): Promise<number>
    deleteAll(): Promise<number>
}

class IngredientnutritionRepository implements IIngredientnutritionRepository {
    async save(ingredientnutrition:Ingredientnutrition): Promise<Ingredientnutrition> {
        try {
            const connect = AppDataSource.getRepository(Ingredientnutrition)
            const info = await connect.find(
                { where: { nutrition_nutrition_id: ingredientnutrition.nutrition_nutrition_id, ingredients_ingredient_id: ingredientnutrition.ingredients_ingredient_id}}
            );

            if (info.length > 0) {
                logging.error(NAMESPACE, "Duplicate ingredientnutrition.");
                throw 'Duplicate ingredientnutrition.';
            }
            
            const result = await connect.save(ingredientnutrition);
            logging.info(NAMESPACE, "Save ingredientnutrition successfully.");
            try {
                const res = await this.retrieveById(result.ingredient_nutrition_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveById from insert ingredientnutrition');
                throw err;
            }
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(ingredientnutrition: Ingredientnutrition): Promise<Ingredientnutrition> {
        let result: Ingredientnutrition | undefined;
        try {
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                try {
                    const connect = transactionalEntityManager.getRepository(Ingredientnutrition);
                    const existingIngredientnutrition = await connect
                    .createQueryBuilder()
                    .select()
                    .setLock("pessimistic_write")
                    .where("nutrition_nutrition_id = :nutrition_nutrition_id AND ingredients_ingredient_id = :ingredients_ingredient_id", {
                        nutrition_nutrition_id: ingredientnutrition.nutrition_nutrition_id,
                        ingredients_ingredient_id: ingredientnutrition.ingredients_ingredient_id,
                    })
                    .getOne();

                    if (!existingIngredientnutrition) {
                        try {
                            ingredientnutrition.create_by = `${ingredientnutrition.update_by}`;
                            const res = await connect.save(ingredientnutrition);
                            logging.info(NAMESPACE, "Update ingredientnutrition successfully.");

                            result = await this.retrieveById(res.ingredient_nutrition_id);
                            return result;
                        }catch (err) {
                            logging.error(NAMESPACE, 'Error saving new ingredientnutrition');
                            throw err;
                        }
                    }else {
                        await connect.update({ ingredient_nutrition_id: existingIngredientnutrition.ingredient_nutrition_id }, ingredientnutrition);
                        logging.info(NAMESPACE, "Update ingredientnutrition successfully.");
                        result = await this.retrieveById(existingIngredientnutrition.ingredient_nutrition_id);
                        return result;
                    }  
                }catch (err) {
                    logging.error(NAMESPACE, 'Error call retrieveById from insert diseasenutrition');
                    throw err;
                }
            });
            return result!;
        }catch (err) {
            logging.error(NAMESPACE, 'Error executing transaction: ' + (err as Error).message, err);
            throw err;
        }
        /*
        try {
            const connect = AppDataSource.getRepository(Ingredientnutrition)
            const info = await connect.findOne({
                where: { nutrition_nutrition_id: ingredientnutrition.nutrition_nutrition_id, ingredients_ingredient_id: ingredientnutrition.ingredients_ingredient_id}
            });
            if (!info) {
                ingredientnutrition.create_by = `${ingredientnutrition.update_by}`;
                try {
                    const result = await connect.save(ingredientnutrition);
                    logging.info(NAMESPACE, "Update ingredientnutrition successfully.");
                    try {
                        const res = await this.retrieveById(result.ingredient_nutrition_id);
                        return res;
                    }catch(err){
                        logging.error(NAMESPACE, 'Error call retrieveById from insert ingredientnutrition');
                        throw err;
                    }
                }catch(err){
                    logging.error(NAMESPACE, (err as Error).message, err);
                    throw err;
                }
            }else {
                try {
                    const result = await connect.update({ ingredient_nutrition_id : info.ingredient_nutrition_id}, ingredientnutrition);
                    logging.info(NAMESPACE, "Update ingredientnutrition successfully.");
                    try {
                        const res = await this.retrieveById(info.ingredient_nutrition_id);
                        return res;
                    }catch(err){
                        logging.error(NAMESPACE, 'Error call retrieveById from insert ingredientnutrition');
                        throw err;
                    }
                }catch(err){
                    logging.error(NAMESPACE, (err as Error).message, err);
                    throw err;
                }
            }
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
        */
    }

    async retrieveById(ingredientnutritionid: string): Promise<Ingredientnutrition> {
        try {
            const result = await AppDataSource.getRepository(Ingredientnutrition).findOne({
                where: { ingredient_nutrition_id : ingredientnutritionid },
                select: ["ingredient_nutrition_id","nutrition_nutrition_id","ingredients_ingredient_id","nutrient_value"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found ingredientnutrition with id: " + ingredientnutritionid);
                throw new Error("Not found ingredientnutrition with id: " + ingredientnutritionid);
            }
            logging.info(NAMESPACE, "Get ingredientnutrition by id successfully.");
            return result;
        }catch(err){   
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByIngredientId(ingredientid: string): Promise<any[]> {
        try {
            const result = await AppDataSource.getRepository(Ingredientnutrition)
            .createQueryBuilder("ingredientnutrition")
            .innerJoinAndSelect(Nutrition, "nutrition", "nutrition.nutrition_id = ingredientnutrition.nutrition_nutrition_id")
            .select([
                "ingredientnutrition.ingredient_nutrition_id AS ingredient_nutrition_id",
                "ingredientnutrition.nutrition_nutrition_id AS nutrition_id",
                "ingredientnutrition.ingredients_ingredient_id AS ingredient_id",
                "nutrition.nutrient_name AS nutrient_name",
                "ingredientnutrition.nutrient_value AS nutrient_value"
            ])
            .where("ingredientnutrition.ingredients_ingredient_id = :ingredientid", { ingredientid: ingredientid })
            .getRawMany();
            logging.info(NAMESPACE, "Get ingredientnutrition by ingredient id successfully.");
            return result;
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByIngredientId(ingredientid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Ingredientnutrition)
            const result = await connect.delete({ ingredients_ingredient_id : ingredientid});
            if (result.affected === 0){
                logging.error(NAMESPACE, "Not found ingredientnutrition with ingredient id: " + ingredientid);
                return 0;
            }
            logging.info(NAMESPACE, "Delete ingredientnutrition by ingredient id successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByNutritionId(nutritionid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Ingredientnutrition);
            const result = await connect.delete({ nutrition_nutrition_id: nutritionid });
            if (result.affected === 0) {
                logging.error(NAMESPACE, `No ingredientnutrition found with nutritionid: ${nutritionid}. Nothing to delete.`);
                return 0;
            }
            logging.info(NAMESPACE, `Delete ingredientnutrition by nutritionid: ${nutritionid} successfully.`);
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number>{
        try {
            const result = await AppDataSource.getRepository(Ingredientnutrition).delete({});
            logging.info(NAMESPACE, "Delete all ingredientnutrition successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new IngredientnutritionRepository();