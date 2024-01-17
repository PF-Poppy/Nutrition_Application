import { Profilepet } from "../entity/profilepet.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";
import { ca } from "date-fns/locale";

const NAMESPACE = "Profilepet Repository";

interface IProfilepetRepository {
    save(profilepet: Profilepet): Promise<Profilepet>;
    update(profilepet: Profilepet): Promise<Profilepet>;
    retrieveById(profileid: string): Promise<Profilepet | undefined>;
    retrieveByPetId(petid: string): Promise<Profilepet | undefined>;
    deleteByPetId(petid: string): Promise<number>;
}

class ProfilepetRepository implements IProfilepetRepository {
    async save(profilepet: Profilepet): Promise<Profilepet> {
        try {
            const connect = AppDataSource.getRepository(Profilepet)
            const result = await connect.save(profilepet);
            logging.info(NAMESPACE, "Save profilepet successfully.");
            try {
                const res = await this.retrieveById(result.profile_id);
                return res;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveById from insert profilepet');
                throw err;
            }
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(profilepet: Profilepet): Promise<Profilepet> {
        let result: Profilepet | undefined;
        try {
            await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                try {
                    const connect = transactionalEntityManager.getRepository(Profilepet);
                    await connect.query("BEGIN");
                    const existingPetprofile = await connect
                    .createQueryBuilder()
                    .select()
                    .where("pet_pet_id = :pet_pet_id", { pet_pet_id: profilepet.pet_pet_id })
                    .getOne();

                    if (!existingPetprofile) {
                        logging.error(NAMESPACE, "Not found profilepet with petid: " + profilepet.pet_pet_id);
                        throw new Error("Not found profilepet with petid: " + profilepet.pet_pet_id);
                    }

                    await connect.update({ pet_pet_id: profilepet.pet_pet_id }, profilepet);
                    logging.info(NAMESPACE, "Update profilepet successfully.");
                    await connect.query("COMMIT")
                    try {
                        result = await this.retrieveByPetId(profilepet.pet_pet_id);
                        return result;
                    }catch (err) {
                        logging.error(NAMESPACE, 'Error call retrieveById from update profilepet');
                        throw err;
                    }
                }catch (err) {
                    logging.error(NAMESPACE, 'Error call retrieveById from update animal type');
                    throw err;
                }
            });
            return result!;
        }catch (err) {
            logging.error(NAMESPACE, 'Error executing transaction: ' + (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByPetId(petid: string): Promise<Profilepet> {
        try {
            const result = await AppDataSource.getRepository(Profilepet).findOne({
                where: { pet_pet_id: petid },
                select: ["profile_id", "pet_pet_id", "weight", "neutering_status", "petBirthDate", "activitie", "factor_type", "factor_number", "physiology_status"],
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found profilepet with petid: " + petid);
                throw 'Not found profilepet with petid: ' + petid;
            }
            logging.info(NAMESPACE, "Retrieve profilepet successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(profileid: string): Promise<Profilepet> {
        try {
            const result = await AppDataSource.getRepository(Profilepet).findOne({
                where: { profile_id: profileid },
                select: ["profile_id", "pet_pet_id", "weight", "neutering_status", "petBirthDate", "activitie", "factor_type", "factor_number", "physiology_status"],
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found profilepet with id: " + profileid);
                throw 'Not found profilepet with id: ' + profileid;
            }
            logging.info(NAMESPACE, "Retrieve profilepet successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByPetId(petid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Profilepet)
            const result = await connect.delete({ pet_pet_id : petid});
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found profilepet with petid: " + petid);
                return 0;
            }
            logging.info(NAMESPACE, "Delete profilepet successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new ProfilepetRepository;