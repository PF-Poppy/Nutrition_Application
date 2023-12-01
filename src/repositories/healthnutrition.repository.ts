import { Healthnutrition } from "../entity/healthnutrition.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Healthnutrition Repository";

interface IHealthnutritionRepository {
    save(healthnutrition:Healthnutrition): Promise<Healthnutrition>;
    retrieveById(healthnutritionid: number): Promise<Healthnutrition | undefined>;
    retrieveByHealthID(healthid: number): Promise<Healthnutrition[]>;
}

class HealthnutritionRepository implements IHealthnutritionRepository {
    async save(healthnutrition:Healthnutrition): Promise<Healthnutrition> {
        try {
            const result = await AppDataSource.getRepository(Healthnutrition).save(healthnutrition);
            logging.info(NAMESPACE, "Save healthnutrition successfully.");
            try {
                const res = await this.retrieveById(result.healthnutrition_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveByID from insert healthnutrition');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(healthnutritionid: number): Promise<Healthnutrition> {
        try {
            const result = await AppDataSource.getRepository(Healthnutrition).findOne({
                where: { healthnutrition_id: healthnutritionid }, 
                select: ["healthnutrition_id","healthdetail_health_id","nutrition_nutrition_id","value_max","value_min"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found healthnutrition with id: " + healthnutritionid);
                throw new Error("Not found healthnutrition with id: " + healthnutritionid);
            }
            logging.info(NAMESPACE, "Retrieve healthnutrition by id successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByHealthID(healthid: number): Promise<Healthnutrition[]> {
        try {
            const result = await AppDataSource.getRepository(Healthnutrition).find({
                where: { healthdetail_health_id : healthid }, 
                select: ["healthnutrition_id","healthdetail_health_id","nutrition_nutrition_id","value_max","value_min"]
            });
            logging.info(NAMESPACE, "Retrieve healthdetail by animal type id successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new HealthnutritionRepository();
