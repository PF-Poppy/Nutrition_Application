import { AnimalType } from "../entity/animaltype.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Animal Repository";

interface IAnimalRepository {
    save(animal:AnimalType): Promise<AnimalType>;
    update(animal:AnimalType,username:string,userid:string): Promise<AnimalType>;
    retrieveAll(): Promise<AnimalType[]>;
    retrieveById(typeid: number): Promise<AnimalType | undefined>;
    retrieveByName(typename: string): Promise<AnimalType | undefined>;
    deleteByID(typeid: number): Promise<number>;
    deleteAll(): Promise<number>;
}

class AnimalRepository implements IAnimalRepository {
    async save(animal:AnimalType): Promise<AnimalType> {
        try {
            const type = await AppDataSource.getRepository(AnimalType).find(
                { where: { type_name: animal.type_name } }
            );
            if (type.length > 0) {
                logging.error(NAMESPACE, "Duplicate animal type name.");
                throw 'Duplicate animal type name.';
            } 
            const result = await AppDataSource.getRepository(AnimalType).save(animal);
            logging.info(NAMESPACE, "Save animal type successfully.");
            try {
                const res = await this.retrieveById(result.type_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveByID from insert animal type');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(animal:AnimalType,username:string,userid:string): Promise<AnimalType> {
        try {
            const connect = AppDataSource.getRepository(AnimalType)
            const type = await connect.findOne(
                {where: { type_id : animal.type_id }}
            );
            if (!type) {
                logging.error(NAMESPACE, "Not found animal type with id: " + animal.type_id);
                throw new Error("Not found animal type with id: " + animal.type_id);
            }
            type.type_name = animal.type_name;
            try {
                const result = await connect.save(type);
                logging.info(NAMESPACE, "Update animal type successfully.");
                return result;
            } catch (err) {
                logging.error(NAMESPACE, (err as Error).message, err);
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveAll(): Promise<AnimalType[]>{
        try {
            const result = await AppDataSource.getRepository(AnimalType).find();
            logging.info(NAMESPACE, "Get all animal type successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(typeid: number): Promise<AnimalType>{
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

    async deleteByID(typeid: number): Promise<number>{
        try {
            const connect = AppDataSource.getRepository(AnimalType)
            const type = await connect.findOne(
                {where: { type_id : typeid }}
            );
            if (!type) {
                logging.error(NAMESPACE, "Not found animal type with id: " + typeid);
                throw new Error("Not found animal type with id: " + typeid);
            }
            const result = await connect.delete(typeid);
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