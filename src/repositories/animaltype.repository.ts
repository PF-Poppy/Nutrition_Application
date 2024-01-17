import { AnimalType } from "../entity/animaltype.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "AnimalType Repositor";

interface IAnimalRepository {
    save(animal:AnimalType): Promise<AnimalType>;
    update(animal:AnimalType): Promise<AnimalType>;
    retrieveAll(): Promise<AnimalType[]>;
    retrieveById(typeid: string): Promise<AnimalType | undefined>;
    retrieveByName(typename: string): Promise<AnimalType | undefined>;
    deleteById(typeid: string): Promise<number>;
    deleteAll(): Promise<number>;
}

class AnimalRepository implements IAnimalRepository {
    async save(animal:AnimalType): Promise<AnimalType> {
        try {
            const connect = AppDataSource.getRepository(AnimalType)
            const duplicateType = await connect.findOne(
                { where: { type_name: animal.type_name } }
            );
            if (duplicateType) {
                logging.error(NAMESPACE, "Duplicate animal type name.");
                throw 'Duplicate animal type name.';
            } 
            
            const result = await connect.save(animal);
            logging.info(NAMESPACE, "Save animal type successfully.");
            try {
                const res = await this.retrieveById(result.type_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveById from insert animal type');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(animal:AnimalType): Promise<AnimalType> {
        let result: AnimalType | undefined;
        try {
            const connect = AppDataSource.getRepository(AnimalType);
            const existingType = await connect.findOne({ where: { type_id: animal.type_id } });

            if (!existingType) {
                logging.error(NAMESPACE, "Not found animal type with id: " + animal.type_id);
                throw new Error("Not found animal type with id: " + animal.type_id);
            }

            const duplicateType = await connect.findOne({ where: { type_name: animal.type_name } });
            if (duplicateType && duplicateType.type_id !== animal.type_id) {
                logging.error(NAMESPACE, "Duplicate animal type name.");
                throw new Error("Duplicate animal type name.");
            }

            await connect.update({ type_id: animal.type_id }, animal);
            logging.info(NAMESPACE, "Update animal type successfully.");
            try {
                result = await this.retrieveById(animal.type_id);
                return result;
            } catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveById from update animal type');
                throw err;
            }

        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
    /*
    async update(animal:AnimalType): Promise<AnimalType> {
        let result: AnimalType | undefined;
        try {
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                try {
                    const connect = transactionalEntityManager.getRepository(AnimalType);
                    await connect.query("BEGIN");
                    const existingType = await connect
                    .createQueryBuilder()
                    .select()
                    .setLock("pessimistic_write")
                    .where("type_id = :type_id", { type_id: animal.type_id })
                    .getOne();

                    if (!existingType) {
                        logging.error(NAMESPACE, "Not found animal type with id: " + animal.type_id);
                        throw new Error("Not found animal type with id: " + animal.type_id);
                    }

                    const duplicateType = await connect.findOne({ where: { type_name: animal.type_name } });
                    if (duplicateType && duplicateType.type_id !== animal.type_id) {
                        logging.error(NAMESPACE, "Duplicate animal type name.");
                        throw new Error("Duplicate animal type name.");
                    }

                    await connect.update({ type_id: animal.type_id }, animal);
                    logging.info(NAMESPACE, "Update animal type successfully.");
                    await connect.query("COMMIT");
                    try {
                        result = await this.retrieveById(animal.type_id);
                        return result;
                    } catch (err) {
                        logging.error(NAMESPACE, 'Error call retrieveById from update animal type');
                        throw err;
                    }

                } catch (err) {
                    logging.error(NAMESPACE, (err as Error).message, err);
                    throw err;
                }
            });
            return result!;
        }catch (err) {
            logging.error(NAMESPACE, 'Error executing transaction: ' + (err as Error).message, err);
            throw err;
        }
    }
    */

    async retrieveAll(): Promise<AnimalType[]>{
        try {
            const result = await AppDataSource.getRepository(AnimalType).find({
                select: ["type_id","type_name"]
            });
            logging.info(NAMESPACE, "Get all animal type successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(typeid: string): Promise<AnimalType>{
        try {
            const result = await AppDataSource.getRepository(AnimalType).findOne({
                where: { type_id : typeid },
                select: ["type_id","type_name"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found animal type with id: " + typeid);
                throw new Error("Not found animal type with id: " + typeid);
            }
            logging.info(NAMESPACE, "Get animal type by id successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByName(typename: string): Promise<AnimalType>{
        try {
            const result = await AppDataSource.getRepository(AnimalType).findOne({
                where: { type_name : typename },
                select: ["type_id","type_name"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found animal type with name: " + typename);
                throw new Error("Not found animal type with name: " + typename);
            }
            logging.info(NAMESPACE, "Get animal type by name successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(typeid: string): Promise<number>{
        try {
            const connect = AppDataSource.getRepository(AnimalType)
            const result = await connect.delete({ type_id : typeid });
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found animal type with id: " + typeid);
                throw new Error("Not found animal type with id: " + typeid);
            }
            logging.info(NAMESPACE, "Delete animal type by id successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number>{
        try {
            const result = await AppDataSource.getRepository(AnimalType).delete({});
            logging.info(NAMESPACE, "Delete all animal type successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new AnimalRepository();