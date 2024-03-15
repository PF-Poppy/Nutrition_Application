import { Ingredientnutritionprimary } from "../entity/ingredientnutritionprimary.entity";
import { Nutritionprimary } from "../entity/nutritionprimary.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Ingredientnutrition Repository";

interface IIngredientnutritionRepository {
    save(ingredientnutrition:Ingredientnutritionprimary): Promise<Ingredientnutritionprimary>;
    update(ingredientnutrition:Ingredientnutritionprimary): Promise<Ingredientnutritionprimary>; 
    retrieveById(ingredientnutritionid: string): Promise<Ingredientnutritionprimary | undefined>;
    retrieveByIngredientId(ingredientid: string): Promise<any[]>;
    deleteByIngredientId(ingredientid: string): Promise<number>
    deleteByNutritionId(nutritionid: string): Promise<number>
    deleteAll(): Promise<number>
}

class IngredientnutritionRepository implements IIngredientnutritionRepository {
    async save(ingredientnutrition:Ingredientnutritionprimary): Promise<Ingredientnutritionprimary> {
        try {
            const connect = AppDataSource.getRepository(Ingredientnutritionprimary)
            const duplicate = await connect.findOne(
                { where: { nutritionprimary_nutrition_id: ingredientnutrition.nutritionprimary_nutrition_id, ingredients_ingredient_id: ingredientnutrition.ingredients_ingredient_id}}
            );

            if (duplicate) {
                logging.error(NAMESPACE, "Duplicate ingredientnutrition.");
                throw 'Duplicate ingredientnutrition.';
            }
            
            const result = await connect.save(ingredientnutrition);
            logging.info(NAMESPACE, "Save ingredientnutrition successfully.");
            try {
                const res = await this.retrieveById(result.ingredient_nutritionprimary_id);
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
    
    async update(ingredientnutrition: Ingredientnutritionprimary): Promise<Ingredientnutritionprimary> {
        let result: Ingredientnutritionprimary | undefined;
        try {
            const connect = AppDataSource.getRepository(Ingredientnutritionprimary);
            const existingIngredientnutrition = await connect.findOne(
                { where: { nutritionprimary_nutrition_id: ingredientnutrition.nutritionprimary_nutrition_id, ingredients_ingredient_id: ingredientnutrition.ingredients_ingredient_id}}
            );
       
            if (!existingIngredientnutrition) {
                ingredientnutrition.create_by = `${ingredientnutrition.update_by}`;
                try {
                    const res = await connect.save(ingredientnutrition);
                    logging.info(NAMESPACE, "Update ingredientnutrition successfully.");
                    try {
                        result = await this.retrieveById(res.ingredient_nutritionprimary_id);
                        return result!;
                    } catch(err) {
                        logging.error(NAMESPACE, 'Error call retrieveById from insert ingredientnutrition');
                        throw err;
                    }
                } catch (err) {
                    logging.error(NAMESPACE, 'Error saving new ingredientnutrition');
                    throw err;
                }
            } else if (existingIngredientnutrition) {
                try {
                    await connect.update({ ingredient_nutritionprimary_id: existingIngredientnutrition.ingredient_nutritionprimary_id }, ingredientnutrition);
                    logging.info(NAMESPACE, "Update ingredientnutrition successfully.");
                    try {
                        result = await this.retrieveById(existingIngredientnutrition.ingredient_nutritionprimary_id);
                        return result!;
                    } catch(err) {
                        logging.error(NAMESPACE, 'Error call retrieveById from insert ingredientnutrition');
                        throw err;
                    }
                } catch (err) {
                    logging.error(NAMESPACE, 'Error saving new ingredientnutrition');
                    throw err;
                }
            } 
            return result!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
    
    
    /*
    async update(ingredientnutrition: Ingredientnutrition): Promise<Ingredientnutrition> {
        let result: Ingredientnutrition | undefined;
        try {
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                try {
                    const connect = transactionalEntityManager.getRepository(Ingredientnutrition);
                    await connect.query("BEGIN");
                    const existingIngredientnutrition = await connect
                    .createQueryBuilder()
                    .select()
                    .setLock("pessimistic_write")
                    .where("nutritionprimary_nutrition_id = :nutritionprimary_nutrition_id AND ingredients_ingredient_id = :ingredients_ingredient_id", {
                        nutritionprimary_nutrition_id: ingredientnutrition.nutritionprimary_nutrition_id,
                        ingredients_ingredient_id: ingredientnutrition.ingredients_ingredient_id,
                    })
                    .getOne();
                
                    if (!existingIngredientnutrition) {
                        ingredientnutrition.create_by = `${ingredientnutrition.update_by}`;
                        try {
                            const res = await connect.save(ingredientnutrition);
                            logging.info(NAMESPACE, "Update ingredientnutrition successfully.");
                            await connect.query("COMMIT");
                            try {
                                result = await this.retrieveById(res.ingredient_nutrition_id);
                                return result;
                            } catch(err) {
                                logging.error(NAMESPACE, 'Error call retrieveById from insert ingredientnutrition');
                                throw err;
                            }
                        } catch (err) {
                            await connect.query("ROLLBACK");
                            logging.error(NAMESPACE, 'Error saving new ingredientnutrition');
                            throw err;
                        }
                    } else if (existingIngredientnutrition) {
                        try {
                            await connect.update({ ingredient_nutrition_id: existingIngredientnutrition.ingredient_nutrition_id }, ingredientnutrition);
                            logging.info(NAMESPACE, "Update ingredientnutrition successfully.");
                            await connect.query("COMMIT");
                            try {
                                result = await this.retrieveById(existingIngredientnutrition.ingredient_nutrition_id);
                                return result;
                            } catch(err) {
                                logging.error(NAMESPACE, 'Error call retrieveById from insert ingredientnutrition');
                                throw err;
                            }
                        } catch (err) {
                            await connect.query("ROLLBACK");
                            logging.error(NAMESPACE, 'Error saving new ingredientnutrition');
                            throw err;
                        }
                    } 
                } catch (err) {
                    logging.error(NAMESPACE, 'Error executing transaction: ' + (err as Error).message, err);
                    throw err;
                }
            });
            return result!;
        }catch (err) {
            logging.error(NAMESPACE, 'Error executing transaction: ' + (err as Error).message, err);
            throw err;
        }
    }
    */
    

    async retrieveById(ingredientnutritionid: string): Promise<Ingredientnutritionprimary> {
        try {
            
            const result = await AppDataSource.getRepository(Ingredientnutritionprimary).findOne({
                where: { ingredient_nutritionprimary_id : ingredientnutritionid },
                select: ["ingredient_nutritionprimary_id","nutritionprimary_nutrition_id","ingredients_ingredient_id","nutrient_value"]
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
            const result = await AppDataSource.getRepository(Ingredientnutritionprimary)
            .createQueryBuilder("ingredientnutritionprimary")
            .innerJoinAndSelect(Nutritionprimary, "nutritionprimary", "nutritionprimary.nutrition_id = ingredientnutritionprimary.nutritionprimary_nutrition_id")
            .select([
                "ingredientnutritionprimary.ingredient_nutritionprimary_id AS ingredient_nutrition_id",
                "ingredientnutritionprimary.nutritionprimary_nutrition_id AS nutrition_id",
                "ingredientnutritionprimary.ingredients_ingredient_id AS ingredient_id",
                "nutritionprimary.nutrient_name AS nutrient_name",
                "nutritionprimary.order_value AS order_value",
                "nutritionprimary.nutrient_unit AS nutrient_unit",
                "ingredientnutritionprimary.nutrient_value AS nutrient_value"
            ])
            .where("ingredientnutritionprimary.ingredients_ingredient_id = :ingredientid", { ingredientid: ingredientid })
            .getRawMany();
            logging.info(NAMESPACE, "Get ingredientnutritionprimary by ingredient id successfully.");
            return result;
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByIngredientId(ingredientid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Ingredientnutritionprimary)
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
            const connect = AppDataSource.getRepository(Ingredientnutritionprimary);
            const result = await connect.delete({ nutritionprimary_nutrition_id: nutritionid });
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
            const result = await AppDataSource.getRepository(Ingredientnutritionprimary).delete({});
            logging.info(NAMESPACE, "Delete all ingredientnutrition successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new IngredientnutritionRepository();