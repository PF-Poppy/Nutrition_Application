import { Baseanimaltype } from "../entity/baseanimaltype.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Baseanimaltype Repository";

interface IBaseanimaltypeRepository {
    save(baseanimaltype:Baseanimaltype): Promise<Baseanimaltype>;
    update(baseanimaltype:Baseanimaltype): Promise<Baseanimaltype>;
    retrieveById(baseid: string): Promise<Baseanimaltype | undefined>;
    retrieveByAnimalTypeId(typeid: string): Promise<Baseanimaltype[]>;
    deleteById(baseid: string): Promise<number>;
    deleteAll(): Promise<number>;
}

class BaseanimaltypeRepository implements IBaseanimaltypeRepository {
    async save(baseanimaltype:Baseanimaltype): Promise<Baseanimaltype> {
        try {
            const connect = AppDataSource.getRepository(Baseanimaltype)
            const duplicateType = await connect.findOne(
                { where: { base_name: baseanimaltype.base_name, animaltype_type_id: baseanimaltype.animaltype_type_id } }
            );
            if (duplicateType) {
                logging.error(NAMESPACE, "Duplicate base animal type name.");
                throw 'Duplicate base animal type name.';
            }

            const result = await connect.save(baseanimaltype);
            logging.info(NAMESPACE, "Save base animal type successfully.");
            try {
                const res = await this.retrieveById(result.base_id);
                return res;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveById from insert base animal type');
                throw err;
            }
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(baseanimaltype:Baseanimaltype): Promise<Baseanimaltype> {
        let result: Baseanimaltype | undefined;
        try {
            const connect = AppDataSource.getRepository(Baseanimaltype);
            const existingType = await connect.findOne({ where: { base_id: baseanimaltype.base_id } });

            if (!existingType) {
                logging.error(NAMESPACE, "Not found baseanimaltype with id: " + baseanimaltype.base_id);
                throw new Error("Not found baseanimaltype with id: " + baseanimaltype.base_id);
            }

            const duplicateType = await connect.findOne({ where: { base_name: baseanimaltype.base_name } });
            if (duplicateType && duplicateType.base_id !== baseanimaltype.base_id) {
                logging.error(NAMESPACE, "Duplicate baseanimaltype name.");
                throw new Error("Duplicate baseanimaltype name.");
            }

            await connect.update({ base_id: baseanimaltype.base_id }, baseanimaltype);
            logging.info(NAMESPACE, "Update baseanimaltype successfully.");
            try {
                result = await this.retrieveById(baseanimaltype.base_id);
                return result;
            } catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveById from update baseanimaltype');
                throw err;
            }

        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(baseid: string): Promise<Baseanimaltype> {
        try {
            const result = await AppDataSource.getRepository(Baseanimaltype).findOne(
                { where: { base_id: baseid },
                select: ["base_id", "base_name", "description", "animaltype_type_id"], 
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found base animal type with id: " + baseid);
                throw new Error("Not found base animal type with id: " + baseid);
            }
            logging.info(NAMESPACE, "Retrieve base animal type successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
        
    }

    async retrieveByAnimalTypeId(typeid: string): Promise<Baseanimaltype[]> {
        try {
            const connect = AppDataSource.getRepository(Baseanimaltype);
            const result = await connect.find({
                where: { animaltype_type_id: typeid},
                select: ["base_id", "base_name", "description", "animaltype_type_id"]
            });
            logging.info(NAMESPACE, "Retrieve base animal type by animal type id successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(baseid: string): Promise<number> {
        try{
            const connect = AppDataSource.getRepository(Baseanimaltype);
            const result = await connect.delete({ base_id: baseid });
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found base animal type with id: " + baseid);
                return 0;
            }
            logging.info(NAMESPACE, "Delete base animal type successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Baseanimaltype);
            const result =  await connect.delete({});
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new BaseanimaltypeRepository();