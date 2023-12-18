import { Diseasenutrition } from "../entity/diseasenutrition.entity";
import { Nutrition } from "../entity/nutrition.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";


const NAMESPACE = "Diseasenutrition Repository";

interface IdiseasenutritionRepository {
    save(diseasenutrition:Diseasenutrition): Promise<Diseasenutrition>;
    update(diseasenutrition:Diseasenutrition): Promise<Diseasenutrition>;
    retrieveById(diseasenutritionid: number): Promise<Diseasenutrition | undefined>;
    retrieveByDiseaseId(diseasehid: number): Promise<any[]>;
    deleteById(diseasenutritionid: number): Promise<number>;
    deleteByNutritionId(nutritionid: number): Promise<number>;
    deleteByDiseaseId(diseaseid: number): Promise<number>
    deleteAll(): Promise<number>;
}

class DiseasenutritionRepository implements IdiseasenutritionRepository {
    async save(diseasenutrition:Diseasenutrition): Promise<Diseasenutrition> {
        try {
            const connect = AppDataSource.getRepository(Diseasenutrition)
            const info = await connect.find(
                { where: { diseasedetail_disease_id: diseasenutrition.diseasedetail_disease_id, nutrition_nutrition_id: diseasenutrition.nutrition_nutrition_id } }
            );
            if (info.length > 0) {
                logging.error(NAMESPACE, "Duplicate diseasenutrition.");
                throw 'Duplicate diseasenutrition.';
            } 

            const result = await connect.save(diseasenutrition);
            logging.info(NAMESPACE, "Save diseasenutrition successfully.");
            try {
                const res = await this.retrieveById(result.diseasenutrition_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveById from insert diseasenutrition');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(diseasenutrition:Diseasenutrition): Promise<Diseasenutrition> {
        try {
            const connect = AppDataSource.getRepository(Diseasenutrition)
            const diseasenutritioninfo = await connect.findOne({
                where: { diseasedetail_disease_id: diseasenutrition.diseasedetail_disease_id , nutrition_nutrition_id: diseasenutrition.nutrition_nutrition_id}, 
            });
            if (!diseasenutritioninfo) {
                diseasenutrition.create_by = `${diseasenutrition.update_by}`;
                try {
                    const result = await connect.save(diseasenutrition);
                    logging.info(NAMESPACE, "Update diseasenutrition successfully.");
                    try {
                        const res = await this.retrieveById(result.diseasenutrition_id);
                        return res;
                    }catch(err){
                        logging.error(NAMESPACE, 'Error call retrieveById from insert diseasenutrition');
                        throw err;
                    }
                }catch(err){
                    logging.error(NAMESPACE, (err as Error).message, err);
                    throw err;
                }
            }else{
                try {
                    const result = await connect.update({ diseasenutrition_id : diseasenutritioninfo.diseasenutrition_id }, diseasenutrition);    
                    logging.info(NAMESPACE, "Update diseasenutrition successfully.");
                    try {
                        const res = await this.retrieveById(diseasenutritioninfo.diseasenutrition_id);
                        return res;
                    }catch(err){
                        logging.error(NAMESPACE, 'Error call retrieveById from insert diseasenutrition');
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

    async retrieveById(diseasenutritionid: number): Promise<Diseasenutrition> {
        try {
            const result = await AppDataSource.getRepository(Diseasenutrition).findOne({
                where: { diseasenutrition_id: diseasenutritionid }, 
                select: ["diseasenutrition_id","diseasedetail_disease_id","nutrition_nutrition_id","value_max","value_min"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found diseasenutrition with id: " + diseasenutritionid);
                throw new Error("Not found diseasenutrition with id: " + diseasenutritionid);
            }
            logging.info(NAMESPACE, "Retrieve diseasenutrition by id successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByDiseaseId(diseaseid: number): Promise<any[]> {
        try {
            const result = await AppDataSource.getRepository(Diseasenutrition)
            .createQueryBuilder("diseasenutrition")
            .innerJoinAndSelect(Nutrition, "nutrition", "nutrition.nutrition_id = diseasenutrition.nutrition_nutrition_id")
            .select([
                "diseasenutrition.diseasenutrition_id AS diseasenutrition_id",
                "diseasenutrition.diseasedetail_disease_id AS diseasedetail_disease_id",
                "nutrition.nutrition_id AS nutrition_id",
                "nutrition.nutrient_name AS nutrient_name",
                "diseasenutrition.value_max AS value_max",
                "diseasenutrition.value_min AS value_min"
            ])
            .where("diseasenutrition.diseasedetail_disease_id = :diseaseid", { diseaseid: diseaseid })
            .getRawMany();
            logging.info(NAMESPACE, "Retrieve diseasenutrition by diseaseid successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(diseasenutritionid: number): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Diseasenutrition);
            const result = await connect.delete({ diseasenutrition_id: diseasenutritionid });
            if (result.affected === 0) {
                logging.error(NAMESPACE, `No diseasenutrition found with id: ${diseasenutritionid}. Nothing to delete.`);
                return 0;  
            }
            logging.info(NAMESPACE, `Delete diseasenutrition by id: ${diseasenutritionid} successfully.`);
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByDiseaseId(diseaseid: number): Promise<number>{
        try {
            const connect = AppDataSource.getRepository(Diseasenutrition);
            const result = await connect.delete({ diseasedetail_disease_id: diseaseid });
            if (result.affected === 0) {
                logging.error(NAMESPACE, `No diseasehnutrition found with diseaseid: ${diseaseid}. Nothing to delete.`);
                return 0;  
            }
            logging.info(NAMESPACE, `Delete diseasenutrition by diseaseid: ${diseaseid} successfully.`);
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByNutritionId(nutritionid: number): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Diseasenutrition);
            const result = await connect.delete({ nutrition_nutrition_id: nutritionid });
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
            const result = await AppDataSource.getRepository(Diseasenutrition).delete({});
            logging.info(NAMESPACE, "Delete all animal type successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new DiseasenutritionRepository();
