//TODO แก้
import { Role } from "../entity/role.entity";
import { AppDataSource } from "../db/data-source";
import logging from '../config/logging';

const NAMESPACE = 'UserRole Repository';

interface IROleRepository {
    retrieveByName(rolename:string): Promise<Role | undefined>;
    retrieveAll(): Promise<Role[]>;
}

class ROleRepository implements IROleRepository {
    async retrieveAll():Promise<Role[]>{
        try {
            const result = await AppDataSource.getRepository(Role).find();
            logging.info(NAMESPACE, "Get role by name successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message,err);
            throw err;
        }
    }

    async retrieveByName(name:string): Promise<Role> {
        try {
            const result = await AppDataSource.getRepository(Role).findOne({
                where: { role_name : name },
                select: ["role_id","role_name"]
            });
            return result!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message,err);
            throw err; 
        }
    }
}

export default new ROleRepository();