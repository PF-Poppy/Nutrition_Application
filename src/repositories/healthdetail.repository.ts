import { Healthdetail } from "../entity/healthdetail.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Healthdetail Repository";

interface IHealthdetailRepository {
    save(healthdetail:Healthdetail): Promise<Healthdetail>;
    retrieveByID(healthid: number): Promise<Healthdetail | undefined>;
    retrieveByAnimalTypeID(typeid: number): Promise<Healthdetail[]>;
}

class HealthdetailRepository implements IHealthdetailRepository {
    async save(healthdetail:Healthdetail): Promise<Healthdetail> {
        try {
            const result = await AppDataSource.getRepository(Healthdetail).save(healthdetail);
            logging.info(NAMESPACE, "Save healthdetail successfully.");
            try {
                const res = await this.retrieveByID(result.health_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveByID from insert healthdetail');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByID(healthid: number): Promise<Healthdetail> {
        try {
            const result = await AppDataSource.getRepository(Healthdetail).findOne({
                where: { health_id: healthid }, 
                select: ["health_id","health_name","animaltype_type_id"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found healthdetail with id: " + healthid);
                throw new Error("Not found healthdetail with id: " + healthid);
            }
            logging.info(NAMESPACE, "Retrieve healthdetail by id successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByAnimalTypeID(typeid: number): Promise<Healthdetail[]> {
        try {
            const result = await AppDataSource.getRepository(Healthdetail).find({
                where: { animaltype_type_id : typeid }, 
                select: ["health_id","health_name","animaltype_type_id"]
            });
            logging.info(NAMESPACE, "Retrieve healthdetail by animal type id successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new HealthdetailRepository();
