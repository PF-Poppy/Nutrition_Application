import { Diseasedetail } from "../entity/diseasedetail.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Diseasedetail Repository";

interface IDiseasedetailRepository {
    save(diseasedetail:Diseasedetail): Promise<Diseasedetail>;
    update(diseasedetail:Diseasedetail): Promise<Diseasedetail>;
    retrieveByID(diseaseid: number): Promise<Diseasedetail | undefined>;
    retrieveByAnimalTypeID(typeid: number): Promise<Diseasedetail[]>;
    deleteByID(diseaseid: number): Promise<number>;
    deleteByAnimalTypeID(typeid: number): Promise<number>
    deleteAll(): Promise<number>;
}

class DiseasedetailRepository implements IDiseasedetailRepository {
    async save(diseasedetail:Diseasedetail): Promise<Diseasedetail> {
        try {
            const connect = AppDataSource.getRepository(Diseasedetail)
            const diseaseinfo = await connect.find(
                { where: { disease_name: diseasedetail.disease_name, animaltype_type_id: diseasedetail.animaltype_type_id } }
            );
            if (diseaseinfo.length > 0) {
                logging.error(NAMESPACE, "Duplicate diseasedetail.");
                throw 'Duplicate diseasedetail.';
            } 
            
            const result = await connect.save(diseasedetail);
            logging.info(NAMESPACE, "Save diseasedetail successfully.");
            try {
                const res = await this.retrieveByID(result.disease_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveByID from insert diseasedetail');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(diseasedetail:Diseasedetail): Promise<Diseasedetail> {
        try {
            const connect = AppDataSource.getRepository(Diseasedetail)
            const diseasedetailinfo = await connect.find({
                where: { disease_name: diseasedetail.disease_name , animaltype_type_id: diseasedetail.animaltype_type_id}, 
            });
            if (diseasedetailinfo.length > 0) {
                for (let i = 0; i < diseasedetailinfo.length; i++) {
                    if (diseasedetailinfo[i].disease_id !== diseasedetail.disease_id) {
                        logging.error(NAMESPACE, "Duplicate diseasedetail name.");
                        throw 'Duplicate diseasedetail name.';
                    }
                }
            } 
            try {
                const result = await connect.update({ disease_id : diseasedetail.disease_id }, diseasedetail);    
                logging.info(NAMESPACE, "Update diseasedetail successfully.");
                try {
                    const res = await this.retrieveByID(diseasedetail.disease_id);
                    return res;
                }catch(err){
                    logging.error(NAMESPACE, 'Error call retrieveByID from insert diseasenutrition');
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
    }

    async retrieveByID(diseaseid: number): Promise<Diseasedetail> {
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

    async retrieveByAnimalTypeID(typeid: number): Promise<Diseasedetail[]> {
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

    async deleteByID(diseaseid: number): Promise<number> {
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

    async deleteByAnimalTypeID(typeid: number): Promise<number> {
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