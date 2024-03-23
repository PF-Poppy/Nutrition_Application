import { Defaultnutrition } from "../entity/defaultnutrition.entity";
import { Nutritionsecondary } from "../entity/nutritionsecondary.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";


const NAMESPACE = "Defaultnutrition Repository";

interface IdefaultnutritionRepository {
    save(defaultnutrition:Defaultnutrition): Promise<Defaultnutrition>;
    update(defaultnutrition:Defaultnutrition): Promise<Defaultnutrition>;
    retrieveById(defaultnutrition: string): Promise<Defaultnutrition | undefined>;
    retrieveByAnimalId(animalid: string): Promise<any[]>;
    deleteById(defaultnutritionionid: string): Promise<number>;
    deleteByNutritionId(nutritionid: string): Promise<number>;
    deleteByAnimalId(animalid: string): Promise<number>
    deleteAll(): Promise<number>;
}

class DefaultnutritionRepository implements IdefaultnutritionRepository {
    async save(defaultnutrition:Defaultnutrition): Promise<Defaultnutrition> {
        try {
            const connect = AppDataSource.getRepository(Defaultnutrition)
            const duplicate = await connect.findOne(
                { where: { animaltype_type_id: defaultnutrition.animaltype_type_id, nutritionsecondary_nutrition_id: defaultnutrition.nutritionsecondary_nutrition_id } }
            );
            if (duplicate) {
                logging.error(NAMESPACE, "Duplicate defaultnutrition.");
                throw 'Duplicate defaultnutrition.';
            } 

            const result = await connect.save(defaultnutrition);
            logging.info(NAMESPACE, "Save defaultnutrition successfully.");
            try {
                const res = await this.retrieveById(result.defaultnutrition_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveById from insert defaultnutrition');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(defaultnutrition:Defaultnutrition): Promise<Defaultnutrition> {
        let result: Defaultnutrition | undefined;
        try {
            const connect = AppDataSource.getRepository(Defaultnutrition);
            const existingDefaultnutrition = await connect.findOne({
                where: { animaltype_type_id: defaultnutrition.animaltype_type_id,nutritionsecondary_nutrition_id: defaultnutrition.nutritionsecondary_nutrition_id, }
            });
            
            if (!existingDefaultnutrition) {
                try {
                    defaultnutrition.create_by = `${defaultnutrition.update_by}`;
                    const res = await connect.save(defaultnutrition);
                    logging.info(NAMESPACE, "Update defaultnutrition successfully.");

                    result = await this.retrieveById(res.defaultnutrition_id);
                    return result;
                }catch(err){
                    logging.error(NAMESPACE, 'Error saving new defaultnutrition');
                    throw err;
                }
            }else {
                await connect.update({ defaultnutrition_id: existingDefaultnutrition.defaultnutrition_id }, defaultnutrition);
                logging.info(NAMESPACE, "Update defaultnutrition successfully.");

                result = await this.retrieveById(existingDefaultnutrition.defaultnutrition_id);
                return result;
            }
        }catch(err){
            logging.error(NAMESPACE, 'Error call retrieveById from insert defaultnutrition');
            throw err;
        }
    }

    async retrieveById(defaultnutritionid: string): Promise<Defaultnutrition> {
        try {
            const result = await AppDataSource.getRepository(Defaultnutrition).findOne({
                where: { defaultnutrition_id: defaultnutritionid }, 
                select: ["defaultnutrition_id","animaltype_type_id","nutritionsecondary_nutrition_id","value_max","value_min"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found defaultnutrition with id: " + defaultnutritionid);
                throw new Error("Not found defaultnutrition with id: " + defaultnutritionid);
            }
            logging.info(NAMESPACE, "Retrieve defaultnutrition by id successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByAnimalId(animalid: string): Promise<any[]> {
        try {
            const result = await AppDataSource.getRepository(Defaultnutrition)
            .createQueryBuilder("defaultnutrition")
            .innerJoinAndSelect(Nutritionsecondary, "nutritionsecondary", "nutritionsecondary.nutrition_id = defaultnutrition.nutritionsecondary_nutrition_id")
            .select([
                "defaultnutrition.animaltype_type_id AS animaltype_type_id",
                "nutritionsecondary.nutrition_id AS nutrition_id",
                "nutritionsecondary.nutrient_name AS nutrient_name",
                "nutritionsecondary.order_value AS order_value",
                "nutritionsecondary.nutrient_unit AS nutrient_unit",
                "defaultnutrition.value_max AS value_max",
                "defaultnutrition.value_min AS value_min"
            ])
            .where("defaultnutrition.animaltype_type_id = :animalid", { animalid: animalid })
            .getRawMany();
            logging.info(NAMESPACE, "Retrieve defaultnutrition by animalid successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(defaultnutritionid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Defaultnutrition);
            const result = await connect.delete({ defaultnutrition_id: defaultnutritionid });
            if (result.affected === 0) {
                logging.error(NAMESPACE, `No defaultnutrition found with id: ${defaultnutritionid}. Nothing to delete.`);
                return 0;  
            }
            logging.info(NAMESPACE, `Delete defaultnutrition by id: ${defaultnutritionid} successfully.`);
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByAnimalId(animalid: string): Promise<number>{
        try {
            const connect = AppDataSource.getRepository(Defaultnutrition);
            const result = await connect.delete({ animaltype_type_id: animalid });
            if (result.affected === 0) {
                logging.error(NAMESPACE, `No defaultnutrition found with animalid: ${animalid}. Nothing to delete.`);
                return 0;  
            }
            logging.info(NAMESPACE, `Delete defaultnutrition by animalid: ${animalid} successfully.`);
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByNutritionId(nutritionid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Defaultnutrition);
            const result = await connect.delete({ nutritionsecondary_nutrition_id: nutritionid });
            if (result.affected === 0) {
                logging.error(NAMESPACE, `No diseasenutrition found with nutritionid: ${nutritionid}. Nothing to delete.`);
                return 0;
            }
            logging.info(NAMESPACE, `Delete diseasenutrition by nutritionid: ${nutritionid} successfully.`);
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number>{
        try {
            const result = await AppDataSource.getRepository(Defaultnutrition).delete({});
            logging.info(NAMESPACE, "Delete all animal type successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new DefaultnutritionRepository();
