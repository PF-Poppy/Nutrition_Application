import { Nutritionprimary } from "../entity/nutritionprimary.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Nutritionprimary Repository";

interface INutritionprimaryRepository {
    save(nutrition:Nutritionprimary): Promise<Nutritionprimary>;
    updatenutritionorder_value(nutrient: Nutritionprimary): Promise<Nutritionprimary>;
    update(nutrition:Nutritionprimary): Promise<Nutritionprimary>;
    retrieveAll(): Promise<Nutritionprimary[]>;
    retrieveById(nutrientid: string): Promise<Nutritionprimary | undefined>;
    retrieveByName(nutrientname: string): Promise<Nutritionprimary | undefined>;
    deleteById(nutrientid: string): Promise<number>;
    deleteAll(): Promise<number>;
}

class NutritionprimaryRepository implements INutritionprimaryRepository {
    async save(nutrition: Nutritionprimary): Promise<Nutritionprimary> {
        try {
            const connect = AppDataSource.getRepository(Nutritionprimary)
            const duplicate = await connect.findOne(
                { where: { nutrient_name: nutrition.nutrient_name} }
            );
            if (duplicate) {
                logging.error(NAMESPACE, "Duplicate nutrition name.");
                throw 'Duplicate nutrition name.';
            }

            const result = await connect.save(nutrition);
            logging.info(NAMESPACE, "Save nutrition successfully.");
            try {
                const res = await this.retrieveById(result.nutrition_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveById from insert nutrition');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(nutrition: Nutritionprimary): Promise<Nutritionprimary> {
        let result: Nutritionprimary | undefined;
        try {
            const connect = AppDataSource.getRepository(Nutritionprimary);
            const existingNutrition = await connect.findOne({
                where: { nutrition_id: nutrition.nutrition_id }
            });

            if (!existingNutrition) {
                logging.error(NAMESPACE, "Not found nutrition with id: " + nutrition.nutrition_id);
                throw new Error("Not found nutrition with id: " + nutrition.nutrition_id);
            }

            const duplicateNutrition = await connect.findOne({ where: { nutrient_name: nutrition.nutrient_name} });
            if (duplicateNutrition && duplicateNutrition.nutrition_id !== nutrition.nutrition_id) {
                logging.error(NAMESPACE, "Duplicate nutrition name.");
                throw new Error("Duplicate nutrition name.");
            }

            await connect.update({ nutrition_id: nutrition.nutrition_id }, nutrition);
            logging.info(NAMESPACE, "Update nutrition successfully.");

            try {
                result = await this.retrieveById(nutrition.nutrition_id);
                return result;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveById from update nutrition');
                throw err;
            }
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async updatenutritionorder_value(nutrient: Nutritionprimary): Promise<Nutritionprimary> {
        try {
            const connect = AppDataSource.getRepository(Nutritionprimary)

            await connect.update({ nutrient_name: nutrient.nutrient_name }, nutrient);
            logging.info(NAMESPACE, "Save nutrition successfully.");
            try {
                const res = await this.retrieveByName(nutrient.nutrient_name);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveById from insert nutrition');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
    
    /*
    async update(nutrition: Nutritionprimary): Promise<Nutritionprimary> {
        let result: Nutritionprimary | undefined;
        try {
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                try {
                    const connect = transactionalEntityManager.getRepository(Nutritionprimary);
                    await connect.query("BEGIN");
                    const existingNutrition = await connect
                    .createQueryBuilder()
                    .select()
                    .setLock("pessimistic_write")
                    .where("nutrition_id = :nutrition_id", { nutrition_id: nutrition.nutrition_id })
                    .getOne();
                    console.log(existingNutrition?.nutrition_id);
                    if (!existingNutrition) {
                        logging.error(NAMESPACE, "Not found nutrition with id: " + nutrition.nutrition_id);
                        throw new Error("Not found nutrition with id: " + nutrition.nutrition_id);
                    }

                    const duplicateNutrition = await connect.findOne({ where: { nutrient_name: nutrition.nutrient_name} });
                    if (duplicateNutrition && duplicateNutrition.nutrition_id !== nutrition.nutrition_id) {
                        logging.error(NAMESPACE, "Duplicate nutrition name.");
                        throw new Error("Duplicate nutrition name.");
                    }

                    await connect.update({ nutrition_id: nutrition.nutrition_id }, nutrition);
                    logging.info(NAMESPACE, "Update nutrition successfully.");
                    await connect.query("COMMIT")
                    try {
                        result = await this.retrieveById(nutrition.nutrition_id);
                        return result;
                    }catch (err) {
                        logging.error(NAMESPACE, 'Error call retrieveById from update nutrition');
                        throw err;
                    }
                }catch (err) {
                    logging.error(NAMESPACE, (err as Error).message, err);
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

    async retrieveAll(): Promise<Nutritionprimary[]> {
        try {
            const result = await AppDataSource.getRepository(Nutritionprimary).find({
                select: ["nutrition_id","nutrient_name","nutrient_unit","order_value"]
            });
            logging.info(NAMESPACE, "Get nutrition by name successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(nutrientid: string): Promise<Nutritionprimary>{
        try {
            const result = await AppDataSource.getRepository(Nutritionprimary).findOne({
                where: { nutrition_id : nutrientid },
                select: ["nutrition_id","nutrient_name","nutrient_unit","order_value"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found animal type with id: " + nutrientid);
                throw new Error("Not found animal type with id: " + nutrientid);
            }
            logging.info(NAMESPACE, "Get animal type by id successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
    
    async retrieveByName(nutrientname: string): Promise<Nutritionprimary>{
        try {
            const result = await AppDataSource.getRepository(Nutritionprimary).findOne({
                where: { nutrient_name : nutrientname },
                select: ["nutrition_id","nutrient_name","nutrient_unit","order_value"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found nutrition with name: " + nutrientname);
                throw new Error("Not found nutrition with name: " + nutrientname);
            }
            logging.info(NAMESPACE, "Get nutrition by name successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(nutrientid: string): Promise<number>{
        try {
            const connect = AppDataSource.getRepository(Nutritionprimary)
            const result = await connect.delete({ nutrition_id : nutrientid})
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found nutrition with id: " + nutrientid);
                throw new Error("Not found nutrition with id: " + nutrientid);
            }
            logging.info(NAMESPACE, "Delete nutrition by id successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }

    }

    async deleteAll(): Promise<number>{
        try {
            const result = await AppDataSource.getRepository(Nutritionprimary).delete({});
            logging.info(NAMESPACE, "Delete all nutrition successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new NutritionprimaryRepository();