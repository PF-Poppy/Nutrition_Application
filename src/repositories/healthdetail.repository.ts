import { Healthdetail } from "../entity/healthdetail.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Healthdetail Repository";

interface IHealthdetailRepository {
    save(healthdetail:Healthdetail): Promise<Healthdetail>;
    update(healthdetail:Healthdetail): Promise<Healthdetail>;
    retrieveByID(healthid: number): Promise<Healthdetail | undefined>;
    retrieveByAnimalTypeID(typeid: number): Promise<Healthdetail[]>;
    deleteByID(healthid: number): Promise<number>;
    deleteByAnimalTypeID(typeid: number): Promise<number>
    deleteAll(): Promise<number>;
}

class HealthdetailRepository implements IHealthdetailRepository {
    async save(healthdetail:Healthdetail): Promise<Healthdetail> {
        try {
            const connect = AppDataSource.getRepository(Healthdetail)
            const healthinfo = await connect.find(
                { where: { health_name: healthdetail.health_name, animaltype_type_id: healthdetail.animaltype_type_id } }
            );
            if (healthinfo.length > 0) {
                logging.error(NAMESPACE, "Duplicate healthdetail.");
                throw 'Duplicate healthdetail.';
            } 
            const result = await connect.save(healthdetail);
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

    async update(healthdetail:Healthdetail): Promise<Healthdetail> {
        try {
            const connect = AppDataSource.getRepository(Healthdetail)
            const healthdetailinfo = await connect.findOne({
                where: { health_id: healthdetail.health_id , animaltype_type_id: healthdetail.animaltype_type_id}, 
            });
            if (!healthdetailinfo) {
                healthdetail.create_by = `${healthdetail.update_by}`;
                try {
                    const result = await connect.save(healthdetail);
                    logging.info(NAMESPACE, "Update healthdetail successfully.");
                    try {
                        const res = await this.retrieveByID(result.health_id);
                        return res;
                    }catch(err){
                        logging.error(NAMESPACE, 'Error call retrieveByID from insert healthdetail');
                        throw err;
                    }
                }catch(err){
                    logging.error(NAMESPACE, (err as Error).message, err);
                    throw err;
                }
            }else{
                try {
                    const result = await connect.update({ health_id : healthdetailinfo.health_id }, healthdetail);    
                    logging.info(NAMESPACE, "Update healthdetail successfully.");
                    try {
                        const res = await this.retrieveByID(healthdetailinfo.health_id);
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

    async deleteByID(healthid: number): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Healthdetail);
            const result = await connect.delete({ health_id: healthid });
            if (result.affected === 0) {
                logging.info(NAMESPACE, `No healthdetail found with id: ${healthid}. Nothing to delete.`);
                return 0;
            }
            logging.info(NAMESPACE, `Deleted healthdetail with id ${healthid} successfully.`);
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByAnimalTypeID(typeid: number): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Healthdetail);
            const result = await connect.delete({ animaltype_type_id: typeid });
            if (result.affected === 0) {
                logging.info(NAMESPACE, `No healthdetail found with animaltype id: ${typeid}. Nothing to delete.`);
                return 0;  
            }
            logging.info(NAMESPACE, `Delete healthdetail by animaltype id: ${typeid} successfully.`);
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number>{
        try {
            const result = await AppDataSource.getRepository(Healthdetail).delete({});
            logging.info(NAMESPACE, "Delete all animal type successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new HealthdetailRepository();
