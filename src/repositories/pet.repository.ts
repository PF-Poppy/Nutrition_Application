import { Pet } from "../entity/pet.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Pet Repository";

interface IPetRepository {
    save(pet: Pet): Promise<Pet>;
    update(pet: Pet): Promise<Pet>;
    retrieveAll(): Promise<Pet[]>;
    retrieveByName(petname:string, userid:string): Promise<Pet | undefined>;
    retrieveByID(petid: number): Promise<Pet | undefined>;
    deleteByID(petid: number): Promise<number>;
    deleteAll(): Promise<number>;
}

class PetRepository implements IPetRepository {
    async save(pet: Pet): Promise<Pet> {
        try {
            const connect = AppDataSource.getRepository(Pet)
            const result = await connect.save(pet);
            logging.info(NAMESPACE, "Save pet successfully.");
            try {
                const res = await this.retrieveByID(result.pet_id);
                return res;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveByID from insert pet');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(pet: Pet): Promise<Pet> {
        try {
            const connect = AppDataSource.getRepository(Pet)
            const result = await connect.update({ pet_id : pet.pet_id}, pet);
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found pet with id: " + pet.pet_id);
                throw 'Not found pet with id: ' + pet.pet_id;
            }
            logging.info(NAMESPACE, "Update pet successfully.");
            try {
                const res = await this.retrieveByID(pet.pet_id);
                return res;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveByID from update pet');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveAll(): Promise<Pet[]> {
        try {
            const result = await AppDataSource.getRepository(Pet).find({
                select: ["pet_id","animaltype_type_id","pet_name","weight","neutering_status","age","activitie","factor_type","factor_number","physiology_status","update_date"]
            })
            logging.info(NAMESPACE, "Retrieve all pet successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByName(petname:string, userid:string): Promise<Pet> {
        try {
            const result = await AppDataSource.getRepository(Pet).findOne({
                where: { pet_name: petname, user_user_id: userid },
                select: ["pet_id","animaltype_type_id","pet_name","weight","neutering_status","age","activitie","factor_type","factor_number","physiology_status","update_date"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found pet with name: " + petname);
                throw 'Not found pet with name: ' + petname;
            }
            logging.info(NAMESPACE, "Retrieve pet successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByID(petid: number): Promise<Pet> {
        try {
            const result = await AppDataSource.getRepository(Pet).findOne({
                where: { pet_id: petid },
                select: ["pet_id","animaltype_type_id","pet_name","weight","neutering_status","age","activitie","factor_type","factor_number","physiology_status","update_date"]
            })
            if (!result) {
                logging.error(NAMESPACE, "Not found pet with id: " + petid);
                throw 'Not found pet with id: ' + petid;
            }
            logging.info(NAMESPACE, "Retrieve pet successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByID(petid: number): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Pet)
            const result = await connect.delete({ pet_id: petid});
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found pet with id: " + petid);
                throw 'Not found pet with id: ' + petid;
            }
            logging.info(NAMESPACE, "Delete pet successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number> {
        try {
            const result = await AppDataSource.getRepository(Pet).delete({});
            logging.error(NAMESPACE, "Delete all pet successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

}

export default new PetRepository();