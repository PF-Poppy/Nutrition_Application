import { Nutrition } from "../entity/nutrition.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Nutrition Repository";

interface INutritionRepository {
    save(nutrition:Nutrition): Promise<Nutrition>;
    update(nutrition:Nutrition): Promise<Nutrition>;
    retrieveAll(): Promise<Nutrition[]>;
    retrieveById(nutrientid: number): Promise<Nutrition | undefined>;
    retrieveByName(nutrientname: string): Promise<Nutrition | undefined>;
    deleteById(nutrientid: number): Promise<number>;
    deleteAll(): Promise<number>;
}

class NutritionRepository implements INutritionRepository {
    async save(nutrition: Nutrition): Promise<Nutrition> {
        try {
            const connect = AppDataSource.getRepository(Nutrition)
            const nutrient = await connect.find(
                { where: { nutrient_name: nutrition.nutrient_name } }
            );
            if (nutrient.length > 0) {
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
    
    async update(nutrition: Nutrition): Promise<Nutrition> {
        try {
            const connect = AppDataSource.getRepository(Nutrition)
            const nutrient = await connect.find({
                where: { nutrient_name: nutrition.nutrient_name}
            });
            if (nutrient.length > 0) {
                for (let i = 0; i < nutrient.length; i++) {
                    if (nutrient[i].nutrition_id !== nutrition.nutrition_id) {
                        logging.error(NAMESPACE, "Duplicate nutrition name.");
                        throw 'Duplicate nutrition name.';
                    }
                }
            }
            const result = await connect.update({ nutrition_id : nutrition.nutrition_id}, nutrition);
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found nutrition with id: " + nutrition.nutrition_id);
                throw new Error("Not found nutrition with id: " + nutrition.nutrition_id);
            }
            logging.info(NAMESPACE, "Update nutrition successfully.");
            try {
                const res = await this.retrieveById(nutrition.nutrition_id);
                return res;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveById from update nutrition');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveAll(): Promise<Nutrition[]> {
        try {
            const result = await AppDataSource.getRepository(Nutrition).find({
                select: ["nutrition_id","nutrient_name"]
            });
            logging.info(NAMESPACE, "Get nutrition by name successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(nutrientid: number): Promise<Nutrition>{
        try {
            const result = await AppDataSource.getRepository(Nutrition).findOne({
                where: { nutrition_id : nutrientid },
                select: ["nutrition_id","nutrient_name"]
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
    
    async retrieveByName(nutrientname: string): Promise<Nutrition>{
        try {
            const result = await AppDataSource.getRepository(Nutrition).findOne({
                where: { nutrient_name : nutrientname },
                select: ["nutrition_id","nutrient_name"]
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

    async deleteById(nutrientid: number): Promise<number>{
        try {
            const connect = AppDataSource.getRepository(Nutrition)
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
            const result = await AppDataSource.getRepository(Nutrition).delete({});
            logging.info(NAMESPACE, "Delete all nutrition successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new NutritionRepository();