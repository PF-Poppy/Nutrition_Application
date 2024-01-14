import { Diseasedetail } from "../entity/diseasedetail.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";
import { ca } from "date-fns/locale";

const NAMESPACE = "Diseasedetail Repository";

interface IdiseasedetailRepository {
    save(diseasedetail:Diseasedetail): Promise<Diseasedetail>;
    update(diseasedetail:Diseasedetail): Promise<Diseasedetail>;
    retrieveById(diseaseid: string): Promise<Diseasedetail | undefined>;
    retrieveByAnimalTypeId(typeid: string): Promise<Diseasedetail[]>;
    retrieveByTypeAndDiseaseId(typeid: string, diseaseid: string): Promise<Diseasedetail | undefined>;
    deleteById(diseaseid: string): Promise<number>;
    deleteByAnimalTypeId(typeid: string): Promise<number>
    deleteAll(): Promise<number>;
}

class DiseasedetailRepository implements IdiseasedetailRepository {
    async save(diseasedetail:Diseasedetail): Promise<Diseasedetail> {
        try {
            const connect = AppDataSource.getRepository(Diseasedetail)
            const duplicate = await connect.findOne(
                { where: { disease_name: diseasedetail.disease_name, animaltype_type_id: diseasedetail.animaltype_type_id } }
            );
            if (duplicate) {
                logging.error(NAMESPACE, "Duplicate diseasedetail.");
                throw 'Duplicate diseasedetail.';
            } 
            
            const result = await connect.save(diseasedetail);
            logging.info(NAMESPACE, "Save diseasedetail successfully.");
            try {
                const res = await this.retrieveById(result.disease_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveById from insert diseasedetail');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(diseasedetail:Diseasedetail): Promise<Diseasedetail> {
        let result: Diseasedetail | undefined;
        try {
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {{
                try {
                    const connect = transactionalEntityManager.getRepository(Diseasedetail);
                    const existingDisease = await connect
                    .createQueryBuilder()
                    .select()
                    .setLock("pessimistic_write")
                    .where("disease_id = :disease_id", { disease_id: diseasedetail.disease_id })
                    .getOne();

                    if (!existingDisease) {
                        logging.error(NAMESPACE, "Not found diseasedetail with id: " + diseasedetail.disease_id);
                        throw new Error("Not found diseasedetail with id: " + diseasedetail.disease_id);
                    }

                    const duplicateDisease = await connect.findOne({ where: { disease_name: diseasedetail.disease_name, animaltype_type_id: diseasedetail.animaltype_type_id } });
                    if (duplicateDisease && duplicateDisease.disease_id !== diseasedetail.disease_id) {
                        logging.error(NAMESPACE, "Duplicate diseasedetail name.");
                        throw new Error("Duplicate diseasedetail name.");
                    }

                    await connect.update({ disease_id: diseasedetail.disease_id }, diseasedetail);
                    logging.info(NAMESPACE, "Update diseasedetail successfully.");
                    await connect.query("COMMIT")
                    try {
                        result = await this.retrieveById(diseasedetail.disease_id);
                        return result;
                    }catch (err) {
                        logging.error(NAMESPACE, 'Error call retrieveById from update diseasedetail');
                        throw err;
                    }
                }catch(err){
                    logging.error(NAMESPACE, (err as Error).message, err);
                    throw err;
                }
            }});
            console.log("result: ", result);
            return result!;
        }catch(err){
            logging.error(NAMESPACE, 'Error executing transaction: ' + (err as Error).message, err);
            throw err;
        }
        /*
        try {
            const connect = AppDataSource.getRepository(Diseasedetail)
            const diseasedetailinfo = await connect.find({
                where: { disease_name: diseasedetail.disease_name , animaltype_type_id: diseasedetail.animaltype_type_id}, 
            });
            if (diseasedetailinfo.length > 0) {
                for (let i = 0; i < diseasedetailinfo.length; i++) {
                    if (diseasedetailinfo[i].disease_id !== diseasedetail.disease_id && diseasedetailinfo[i].animaltype_type_id === diseasedetail.animaltype_type_id) {
                        logging.error(NAMESPACE, "Duplicate diseasedetail name.");
                        throw 'Duplicate diseasedetail name.';
                    }
                }
            } 
            try {
                const result = await connect.update({ disease_id : diseasedetail.disease_id }, diseasedetail);    
                logging.info(NAMESPACE, "Update diseasedetail successfully.");
                try {
                    const res = await this.retrieveById(diseasedetail.disease_id);
                    return res;
                }catch(err){
                    logging.error(NAMESPACE, 'Error call retrieveById from insert diseasenutrition');
                    throw err;
                }
            }catch(err){
                logging.error(NAMESPACE, (err as Error).message, err);
                throw err;
            }
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
        */
    }

    async retrieveById(diseaseid: string): Promise<Diseasedetail> {
        try {
            const result = await AppDataSource.getRepository(Diseasedetail).findOne({
                where: { disease_id: diseaseid }, 
                select: ["disease_id","disease_name","animaltype_type_id"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found diseasedetail with id: " + diseaseid);
                throw new Error("Not found diseasedetail with id: " + diseaseid);
            }
            logging.info(NAMESPACE, "Retrieve diseasedetail by id successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByAnimalTypeId(typeid: string): Promise<Diseasedetail[]> {
        try {
            const result = await AppDataSource.getRepository(Diseasedetail).find({
                where: { animaltype_type_id : typeid }, 
                select: ["disease_id","disease_name","animaltype_type_id"]
            });
            logging.info(NAMESPACE, "Retrieve diseasedetail by animal type id successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByTypeAndDiseaseId(typeid: string, diseaseid: string): Promise<Diseasedetail> {
        try {
            const result = await AppDataSource.getRepository(Diseasedetail).findOne({
                where: { disease_id: diseaseid, animaltype_type_id : typeid }, 
                select: ["disease_id","disease_name","animaltype_type_id"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found diseasedetail with id: " + diseaseid);
                throw new Error("Not found diseasedetail with id: " + diseaseid);
            }
            logging.info(NAMESPACE, "Retrieve diseasedetail by id successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(diseaseid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Diseasedetail);
            const result = await connect.delete({ disease_id: diseaseid });
            if (result.affected === 0) {
                logging.error(NAMESPACE, `No diseasedetail found with id: ${diseaseid}. Nothing to delete.`);
                return 0;
            }
            logging.info(NAMESPACE, `Deleted diseasedetail with id ${diseaseid} successfully.`);
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByAnimalTypeId(typeid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Diseasedetail);
            const result = await connect.delete({ animaltype_type_id: typeid });
            if (result.affected === 0) {
                logging.error(NAMESPACE, `No diseasedetail found with animaltype id: ${typeid}. Nothing to delete.`);
                return 0;  
            }
            logging.info(NAMESPACE, `Delete diseasedetail by animaltype id: ${typeid} successfully.`);
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number>{
        try {
            const result = await AppDataSource.getRepository(Diseasedetail).delete({});
            logging.info(NAMESPACE, "Delete all diseasedetail type successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new DiseasedetailRepository();
