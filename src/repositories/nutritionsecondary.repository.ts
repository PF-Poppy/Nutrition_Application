import { Nutritionsecondary } from "../entity/nutritionsecondary.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Nutritionsecondary Repository";

interface INutritionsecondaryRepository {
    save(nutrition:Nutritionsecondary): Promise<Nutritionsecondary>;
    update(nutrition:Nutritionsecondary): Promise<Nutritionsecondary>;
    retrieveAll(): Promise<Nutritionsecondary[]>;
    retrieveById(nutrientid: string): Promise<Nutritionsecondary | undefined>;
    retrieveByName(nutrientname: string): Promise<Nutritionsecondary | undefined>;
    deleteById(nutrientid: string): Promise<number>;
    deleteAll(): Promise<number>;
}

class NutritionsecondaryRepository implements INutritionsecondaryRepository {
    async save(nutrition: Nutritionsecondary): Promise<Nutritionsecondary> {
        try {
            const connect = AppDataSource.getRepository(Nutritionsecondary)
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

    async update(nutrition: Nutritionsecondary): Promise<Nutritionsecondary> {
        let result: Nutritionsecondary | undefined;
        try {
            const connect = AppDataSource.getRepository(Nutritionsecondary);
            const existingNutrition = await connect.findOne({
                where: { nutrition_id: nutrition.nutrition_id }
            });
            
            console.log(existingNutrition?.nutrition_id);
            if (!existingNutrition) {
                logging.error(NAMESPACE, "Not found nutrition with id: " + nutrition.nutrition_id);
                throw new Error("Not found nutrition with id: " + nutrition.nutrition_id);
            }

            const duplicateNutrition = await connect.findOne({ where: { nutrient_name: nutrition.nutrient_name } });
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
    
    /*
    async update(nutrition: Nutritionsecondary): Promise<Nutritionsecondary> {
        let result: Nutritionsecondary | undefined;
        try {
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                try {
                    const connect = transactionalEntityManager.getRepository(Nutritionsecondary);
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

                    const duplicateNutrition = await connect.findOne({ where: { nutrient_name: nutrition.nutrient_name } });
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

    async retrieveAll(): Promise<Nutritionsecondary[]> {
        try {
            const result = await AppDataSource.getRepository(Nutritionsecondary).find({
                select: ["nutrition_id","nutrient_name","nutrient_unit"]
            });
            logging.info(NAMESPACE, "Get nutrition by name successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(nutrientid: string): Promise<Nutritionsecondary>{
        try {
            const result = await AppDataSource.getRepository(Nutritionsecondary).findOne({
                where: { nutrition_id : nutrientid },
                select: ["nutrition_id","nutrient_name","nutrient_unit"]
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
    
    async retrieveByName(nutrientname: string): Promise<Nutritionsecondary>{
        try {
            const result = await AppDataSource.getRepository(Nutritionsecondary).findOne({
                where: { nutrient_name : nutrientname },
                select: ["nutrition_id","nutrient_name","nutrient_unit"]
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
            const connect = AppDataSource.getRepository(Nutritionsecondary)
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
            const result = await AppDataSource.getRepository(Nutritionsecondary).delete({});
            logging.info(NAMESPACE, "Delete all nutrition successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new NutritionsecondaryRepository();