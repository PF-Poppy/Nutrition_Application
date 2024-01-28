//TODO แก้
import { User } from "../entity/user.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "User Repository";

interface IUserRepository {
    retrieveAll(): Promise<User[]>;
    retrieveById(userid:string): Promise<User | undefined>;
    retrieveByName(userid:string): Promise<User | undefined>;
    deleteById(userid:string): Promise<number>;
}

class UserRepository implements IUserRepository {
    async retrieveAll() : Promise<User[]>{
        try {
            const result = await AppDataSource.getRepository(User).find({
                select: ["user_id","firstname","lastname","age","username","password"]
            });
            logging.info(NAMESPACE, "Get all users successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
    async retrieveById(userid:string) : Promise<User>{
        try {
            const result = await AppDataSource.getRepository(User).findOne({
                where: { user_id : userid },
                select: ["user_id","firstname","lastname","age","username","password"]
            });
            logging.info(NAMESPACE, "Get user by id successfully.");
            return result!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByName(username:string) : Promise<User>{
        try {
            const result = await AppDataSource.getRepository(User).findOne({
                where: { username : username },
                select: ["user_id","firstname","lastname","age","username","password"]
            });
            logging.info(NAMESPACE, "Get user by name successfully.");
            return result!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(userid:string) : Promise<number>{
        try {
            const result = await AppDataSource.getRepository(User).delete({
                user_id : userid
            });
            logging.info(NAMESPACE, "Delete user by id successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new UserRepository();