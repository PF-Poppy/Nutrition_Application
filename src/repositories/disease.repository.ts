import { Disease } from "../entity/disease.entity";
import { Diseasedetail } from "../entity/diseasedetail.entity";
import { AppDataSource } from "../db/data-source";
import logging from '../config/logging';

const NAMESPACE = 'Disease Repository';

interface IdiseaseRepository {
    save(disease: Disease): Promise<Disease>;
    update(disease: Disease): Promise<Disease>;
    retrieveById(diseaseid: string): Promise<Disease | undefined>;
    retrieveByPetId(petid: string): Promise<any[]>;
    deleteById(diseaseid: string): Promise<number>;
    deleteByPetId(petid: string): Promise<number>;
    deleteByDiseaseId(diseaseid: string): Promise<number>;
    deleteAll(): Promise<number>;
}

class DiseaseRepository implements IdiseaseRepository {
    async save(disease: Disease): Promise<Disease> {
        try {
            const connect = AppDataSource.getRepository(Disease);
            const duplicate = await connect.findOne(
                { where: { diseasedetail_disease_id: disease.diseasedetail_disease_id, pet_pet_id: disease.pet_pet_id }}
            );
            if (duplicate) {
                logging.error(NAMESPACE, "Duplicate disease.");
                throw 'Duplicate disease.';
            } 
            
            const result = await connect.save(disease);
            logging.info(NAMESPACE, "Save disease successfully.");
            try {
                const res = await this.retrieveById(result.id);
                return res;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveById from insert disease');
                throw err;
            }
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(disease: Disease): Promise<Disease> {
        let result: Disease | undefined;
        try {
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                try {
                    const connect = transactionalEntityManager.getRepository(Disease);
                    await connect.query("BEGIN");
                    const existingDisease = await connect
                    .createQueryBuilder()
                    .select()
                    .setLock("pessimistic_write")
                    .where("pet_pet_id = :pet_pet_id AND diseasedetail_disease_id = :diseasedetail_disease_id", {
                        pet_pet_id: disease.pet_pet_id,
                        diseasedetail_disease_id: disease.diseasedetail_disease_id,
                    })
                    .getOne();
    
                    if (!existingDisease) {
                        try {
                            const res = await connect.save(disease);
                            logging.info(NAMESPACE, "Update disease successfully.");
                            await connect.query("COMMIT")
    
                            result = await this.retrieveById(res.id);
                            return result;
                        } catch (err) {
                            logging.error(NAMESPACE, 'Error saving new disease');
                            throw err;
                        }
                    } else {
                        await connect.update({ id: existingDisease.id }, disease);
                        logging.info(NAMESPACE, "Update disease successfully.");
                        await connect.query("COMMIT")
                        result = await this.retrieveById(existingDisease.id);
                        return result;
                    }
                } catch (err) {
                    logging.error(NAMESPACE, 'Error inside transaction: ' + (err as Error).message, err);
                    throw err;
                }
            });
            return result!;
        } catch (err) {
            logging.error(NAMESPACE, 'Error executing transaction: ' + (err as Error).message, err);
            throw err;
        }
        
        /*
        try {
            const connect = AppDataSource.getRepository(Disease);
            const diseaseinfo = await connect.findOne({
                where: { pet_pet_id: disease.pet_pet_id , diseasedetail_disease_id: disease.diseasedetail_disease_id},
            });
            if (!diseaseinfo) {
                try {
                    const result = await connect.save(disease);
                    logging.info(NAMESPACE, "Update disease successfully.");
                    try {
                        const res = await this.retrieveById(result.id);
                        return res;
                    }catch (err) {
                        logging.error(NAMESPACE, 'Error call retrieveById from update disease');
                        throw err;
                    }
                }catch (err) {
                    logging.error(NAMESPACE, 'Error call retrieveById from update disease');
                    throw err;
                }
            }else {
                const result = await connect.update({ id : diseaseinfo.id }, disease);
                logging.info(NAMESPACE, "Update disease successfully.");
                try {
                    const res = await this.retrieveById(diseaseinfo.id);
                    return res;
                }catch (err) {
                    logging.error(NAMESPACE, 'Error call retrieveById from update disease');
                    throw err;
                }
            }
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
        */
    }

    async retrieveById(diseaseid: string): Promise<Disease>{
        try {
            const result = await AppDataSource.getRepository(Disease).findOne({
                where: { id: diseaseid},
                select: ["id","pet_pet_id","diseasedetail_disease_id"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found disease with id: " + diseaseid);
                throw new Error("Not found disease with id: " + diseaseid);
            }
            logging.info(NAMESPACE, "Retrieve disease successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByPetId(petid: string): Promise<any[]> {
        try {
            const result = await AppDataSource.getRepository(Disease)
            .createQueryBuilder("disease")
            .innerJoinAndSelect(Diseasedetail, "diseasedetail", "diseasedetail.disease_id = disease.diseasedetail_disease_id")
            .select([
                "disease.id AS diseaseid" ,
                "disease.pet_pet_id AS petid",
                "disease.diseasedetail_disease_id AS diseasedetailid",
                "diseasedetail.disease_name AS diseasename",
                "diseasedetail.animaltype_type_id AS animaltypeid",
            ])
            .where("disease.pet_pet_id = :petid", { petid: petid })
            .getRawMany();
            logging.info(NAMESPACE, "Retrieve disease by pet id successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(diseaseid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Disease);
            const result = await connect.delete({ id: diseaseid});
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found disease with id: " + diseaseid);
                return 0;
            }
            logging.info(NAMESPACE, "Delete disease successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByPetId(petid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Disease);
            const result = await connect.delete({ pet_pet_id: petid});
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found disease with pet id: " + petid);
                return 0;
            }
            logging.info(NAMESPACE, "Delete disease successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByDiseaseId(diseaseid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Disease);
            const result = await connect.delete({ diseasedetail_disease_id: diseaseid});
            if (result.affected === 0) {
                logging.error(NAMESPACE, `No disease found with disease id: ${diseaseid}. Nothing to delete.`);
                return 0;
            }
            logging.info(NAMESPACE, `Delete disease by disease id: ${diseaseid} successfully.`);
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number> {
        try {
            const result = await AppDataSource.getRepository(Disease).delete({});
            logging.info(NAMESPACE, "Delete all disease successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new DiseaseRepository();