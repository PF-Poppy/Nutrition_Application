import { Ingredientnutrition } from "../entity/ingredientnutrition.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Ingredientnutrition Repository";

interface IIngredientnutritionRepository {
    save(ingredientnutrition:Ingredientnutrition): Promise<Ingredientnutrition>;
    update(ingredientnutrition:Ingredientnutrition): Promise<Ingredientnutrition>; 
    retrieveByID(ingredientnutritionid: number): Promise<Ingredientnutrition | undefined>;
    retrieveByIngredientID(ingredientid: string): Promise<Ingredientnutrition[]>;
    deleteByIngredientID(ingredientid: string): Promise<number>
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
                const res = await this.retrieveByID(result.ingredient_nutrition_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveByID from insert ingredientnutrition');
                throw err;
            }
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(ingredientnutrition: Ingredientnutrition): Promise<Ingredientnutrition> {
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
                        const res = await this.retrieveByID(result.ingredient_nutrition_id);
                        return res;
                    }catch(err){
                        logging.error(NAMESPACE, 'Error call retrieveByID from insert ingredientnutrition');
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
                        const res = await this.retrieveByID(info.ingredient_nutrition_id);
                        return res;
                    }catch(err){
                        logging.error(NAMESPACE, 'Error call retrieveByID from insert ingredientnutrition');
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
    }

    async retrieveByID(ingredientnutritionid: number): Promise<Ingredientnutrition> {
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

    async retrieveByIngredientID(ingredientid: string): Promise<Ingredientnutrition[]> {
        try {
            const result = await AppDataSource.getRepository(Ingredientnutrition).find({
                where: { ingredients_ingredient_id : ingredientid },
                select: ["ingredient_nutrition_id","nutrition_nutrition_id","ingredients_ingredient_id","nutrient_value"]
            })
            logging.info(NAMESPACE, "Get ingredientnutrition by ingredient id successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByIngredientID(ingredientid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Ingredientnutrition)
            const result = await connect.delete({ ingredients_ingredient_id : ingredientid});
            if (result.affected === 0){
                logging.info(NAMESPACE, "Not found ingredientnutrition with ingredient id: " + ingredientid);
                return 0;
            }
            logging.info(NAMESPACE, "Delete ingredientnutrition by ingredient id successfully.");
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