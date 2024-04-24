import { Physiology } from "../entity/physiology.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";


const NAMESPACE = "Physiology Repository";

interface IphysiologyRepository {
    save(physiology:Physiology): Promise<Physiology>;
    update(physiology:Physiology): Promise<Physiology>;
    retrieveById(physiologyid: string): Promise<Physiology | undefined>;
    retrieveByName(physiologyname: string): Promise<Physiology | undefined>;
    retrieveByAnimalTypeId(typeid: string): Promise<Physiology[]>;
    deleteById(physiologyid: string): Promise<number>;
    deleteAll(): Promise<number>;
}

class PhysiologyRepository implements IphysiologyRepository {
    async save(physiology:Physiology): Promise<Physiology> {
        try {
            const connect = AppDataSource.getRepository(Physiology)
            const duplicate = await connect.findOne({
                where: { physiology_name: physiology.physiology_name, animaltype_type_id: physiology.animaltype_type_id }
            });
            if (duplicate) {
                logging.error(NAMESPACE, "Duplicate physiology with: " + physiology.physiology_name + " and animal type id: " + physiology.animaltype_type_id);
                throw 'Duplicate physiology with: ' + physiology.physiology_name + ' and animal type id: ' + physiology.animaltype_type_id;
            }

            const result = await connect.save(physiology);
            logging.info(NAMESPACE, "Save physiology successfully.");
            try {
                const res = await this.retrieveById(result.physiology_id);
                return res; 
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveById from insert physiology');
                throw err;
            }
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(physiology:Physiology): Promise<Physiology> {
        let result: Physiology | undefined;
        try {
            const connect = AppDataSource.getRepository(Physiology);
            const existingPhysiology = await connect.findOne({
                where: { physiology_id: physiology.physiology_id }
            });

            if (!existingPhysiology) {
                logging.error(NAMESPACE, "Not found physiology with id: " + physiology.physiology_id);
                throw new Error("Not found physiology with id: " + physiology.physiology_id);
            }

            const duplicatePhysiology = await connect.findOne({ where: { physiology_name: physiology.physiology_name, animaltype_type_id: physiology.animaltype_type_id } });
            if (duplicatePhysiology && duplicatePhysiology.physiology_id !== physiology.physiology_id) {
                logging.error(NAMESPACE, "Duplicate physiology with: " + physiology.physiology_name + " and animal type id: " + physiology.animaltype_type_id);
                throw 'Duplicate physiology with: ' + physiology.physiology_name + ' and animal type id: ' + physiology.animaltype_type_id;
            }
            
            await connect.update({ physiology_id: physiology.physiology_id }, physiology);
            logging.info(NAMESPACE, "Update physiology successfully.");
            try {
                result = await this.retrieveById(physiology.physiology_id);
                return result;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveById from update physiology');
                throw err;
            }
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }        
    }

    async retrieveById(physiologyid: string): Promise<Physiology> {
        try {
            const result = await AppDataSource.getRepository(Physiology).findOne({
                where: { physiology_id: physiologyid},
                select: ["physiology_id", "physiology_name", "animaltype_type_id", "description"]
            });

            if (!result) {
                logging.error(NAMESPACE, "Not found physiology with id: " + physiologyid);
                throw new Error("Not found physiology with id: " + physiologyid);
            }
            logging.info(NAMESPACE, "Retrieve physiology by id successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByName(physiologyname: string): Promise<Physiology> {
        try{
            const result = await AppDataSource.getRepository(Physiology).findOne({
                where: { physiology_name: physiologyname },
                select: ["physiology_id", "physiology_name", "animaltype_type_id", "description"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found physiology with name: " + physiologyname);
                throw new Error("Not found physiology with name: " + physiologyname);
            }
            logging.info(NAMESPACE, "Retrieve physiology by name successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByAnimalTypeId(typeid: string): Promise<Physiology[]> {
        try {
            const connect = AppDataSource.getRepository(Physiology);
            const result = await connect.find({
                where: { animaltype_type_id: typeid },
                select: ["physiology_id", "physiology_name", "animaltype_type_id", "description"]
            });
            logging.info(NAMESPACE, "Retrieve physiology by animal type id successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(physiologyid: string): Promise<number> {  
        try {
            const connect = AppDataSource.getRepository(Physiology);
            const result = await connect.delete({ physiology_id: physiologyid});
            if (result.affected === 0){
                logging.error(NAMESPACE, "Not found physiology with id: " + physiologyid);
                return 0;
            }
            logging.info(NAMESPACE, "Delete physiology by id successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Physiology);
            const result = await connect.delete({});
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new PhysiologyRepository();