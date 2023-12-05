import { Nutrition } from "../entity/nutrition.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Nutrition Repository";

interface INutritionRepository {
    retrieveByID(nutrientid: number): Promise<Nutrition | undefined>;
    retrieveByName(nutrientname: string): Promise<Nutrition | undefined>;
}

class NutritionRepository implements INutritionRepository {
    async retrieveByID(nutrientid: number): Promise<Nutrition>{
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
}

export default new NutritionRepository();