import { Nutrition } from "../entity/nutrition.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Nutrition Repository";

interface INutritionRepository {
    //save(animal:AnimalType,username:string,userid:string): Promise<AnimalType>;
    //pdate(animal:AnimalType,username:string,userid:string): Promise<AnimalType>;
    //retrieveAll(): Promise<AnimalType[]>;
    //retrieveById(typeid: number): Promise<AnimalType | null>;
    retrieveByName(name: string): Promise<Nutrition | undefined>;
    //deleteByID(typeid: number): Promise<number>;
    //deleteAll(): Promise<number>;
}

class NutritionRepository implements INutritionRepository {
    /*
    async save(animal:AnimalType,username:string,userid:string): Promise<AnimalType> {
        try {
            const animalType = new AnimalType();
            animalType.type_name = animal.type_name;
            animalType.create_by = `${userid}_${username}`;
            animalType.update_date = new Date();
            animalType.update_by = `${userid}_${username}`;

            const result = await AppDataSource.getRepository(AnimalType).save(animalType);
            logging.info(NAMESPACE, "Save animal type successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(animal:AnimalType,username:string,userid:string): Promise<AnimalType> {
        try {
            const connect = AppDataSource.getRepository(AnimalType)
            const type = await connect.findOne(
                {where: { type_id : animal.type_id }}
            );
            if (!type) {
                logging.error(NAMESPACE, "Not found animal type with id: " + animal.type_id);
                throw new Error("Not found animal type with id: " + animal.type_id);
            }
            type.type_name = animal.type_name;
            try {
                const result = await connect.save(type);
                logging.info(NAMESPACE, "Update animal type successfully.");
                return result;
            } catch (err) {
                logging.error(NAMESPACE, (err as Error).message, err);
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveAll(): Promise<AnimalType[]>{
        try {
            const result = await AppDataSource.getRepository(AnimalType).find();
            logging.info(NAMESPACE, "Get all animal type successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(typeid: number): Promise<AnimalType | null>{
        try {
            const result = await AppDataSource.getRepository(AnimalType).findOne({
                where: { type_id : typeid },
                select: ["type_id","type_name"]
            });
            logging.info(NAMESPACE, "Get animal type by id successfully.");
            return result || null;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
    */

    async retrieveByName(name: string): Promise<Nutrition>{
        try {
            const result = await AppDataSource.getRepository(Nutrition).findOne({
                where: { nutrient_name : name },
                select: ["nutrition_id","nutrient_name"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found nutrition with name: " + name);
                throw new Error("Not found nutrition with name: " + name);
            }
            logging.info(NAMESPACE, "Get nutrition by name successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
    /*
    async deleteByID(typeid: number): Promise<number>{
        try {
            const connect = AppDataSource.getRepository(AnimalType)
            const type = await connect.findOne(
                {where: { type_id : typeid }}
            );
            if (!type) {
                logging.error(NAMESPACE, "Not found animal type with id: " + typeid);
                throw new Error("Not found animal type with id: " + typeid);
            }
            const result = await connect.delete(typeid);
            logging.info(NAMESPACE, "Delete animal type by id successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number>{
        try {
            const result = await AppDataSource.getRepository(AnimalType).delete({});
            logging.info(NAMESPACE, "Delete all animal type successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
    */
}

export default new NutritionRepository();