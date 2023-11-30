//TODO แก้
import { User } from "../entity/user.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "User Repository";

interface IUserRepository {
    retrieveByID(userid:string): Promise<User | undefined>;
}

class UserRepository implements IUserRepository {
    async retrieveByID(userid:string) : Promise<User>{
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
            logging.info(NAMESPACE, "Get user by id successfully.");
            return result!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new UserRepository();