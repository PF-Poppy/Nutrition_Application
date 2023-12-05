import { Healthnutrition } from "../entity/healthnutrition.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";
import { tr } from "date-fns/locale";

const NAMESPACE = "Healthnutrition Repository";

interface IHealthnutritionRepository {
    save(healthnutrition:Healthnutrition): Promise<Healthnutrition>;
    update(healthnutrition:Healthnutrition): Promise<Healthnutrition>;
    retrieveByID(healthnutritionid: number): Promise<Healthnutrition | undefined>;
    retrieveByHealthID(healthid: number): Promise<Healthnutrition[]>;
    deleteByID(healthnutritionid: number): Promise<number>;
    deleteByHealthID(healthid: number): Promise<number>
    deleteAll(): Promise<number>;
}

class HealthnutritionRepository implements IHealthnutritionRepository {
    async save(healthnutrition:Healthnutrition): Promise<Healthnutrition> {
        try {
            const result = await AppDataSource.getRepository(Healthnutrition).save(healthnutrition);
            logging.info(NAMESPACE, "Save healthnutrition successfully.");
            try {
                const res = await this.retrieveByID(result.healthnutrition_id);
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

    async update(healthnutrition:Healthnutrition): Promise<Healthnutrition> {
        try {
            const connect = AppDataSource.getRepository(Healthnutrition)
            const healthnutritioninfo = await connect.findOne({
                where: { healthdetail_health_id: healthnutrition.healthdetail_health_id , nutrition_nutrition_id: healthnutrition.nutrition_nutrition_id}, 
            });
            if (!healthnutritioninfo) {
                healthnutrition.create_by = `${healthnutrition.update_by}`;
                try {
                    const result = await connect.save(healthnutrition);
                    logging.info(NAMESPACE, "Update healthnutrition successfully.");
                    try {
                        const res = await this.retrieveByID(result.healthnutrition_id);
                        return res;
                    }catch(err){
                        logging.error(NAMESPACE, 'Error call retrieveByID from insert healthnutrition');
                        throw err;
                    }
                }catch(err){
                    logging.error(NAMESPACE, (err as Error).message, err);
                    throw err;
                }
            }else{
                try {
                    const result = await connect.update({ healthnutrition_id : healthnutritioninfo.healthnutrition_id }, healthnutrition);    
                    logging.info(NAMESPACE, "Update healthnutrition successfully.");
                    try {
                        const res = await this.retrieveByID(healthnutritioninfo.healthnutrition_id);
                        return res;
                    }catch(err){
                        logging.error(NAMESPACE, 'Error call retrieveByID from insert healthnutrition');
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

    async retrieveByID(healthnutritionid: number): Promise<Healthnutrition> {
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

    async deleteByID(healthnutritionid: number): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Healthnutrition);
            const result = await connect.delete({ healthnutrition_id: healthnutritionid });
            if (result.affected === 0) {
                logging.info(NAMESPACE, `No healthnutrition found with id: ${healthnutritionid}. Nothing to delete.`);
                return 0;  
            }
            logging.info(NAMESPACE, `Delete healthnutrition by id: ${healthnutritionid} successfully.`);
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByHealthID(healthid: number): Promise<number>{
        try {
            const connect = AppDataSource.getRepository(Healthnutrition);
            const result = await connect.delete({ healthdetail_health_id: healthid });
            if (result.affected === 0) {
                logging.info(NAMESPACE, `No healthnutrition found with healthid: ${healthid}. Nothing to delete.`);
                return 0;  
            }
            logging.info(NAMESPACE, `Delete healthnutrition by healthid: ${healthid} successfully.`);
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number>{
        try {
            const result = await AppDataSource.getRepository(Healthnutrition).delete({});
            logging.info(NAMESPACE, "Delete all animal type successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new HealthnutritionRepository();
