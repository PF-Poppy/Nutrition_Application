import { AppDataSource } from "../db/data-source";
import { User } from "../entity/user.entity";
import VerifySignUp from "../middleware/verifySignUp";
import logging from "../config/logging";
import userRespository from "./user.respository";

const NAMESPACE = 'AuthenRepository';

interface IAuthenRepository {
  save(user: User): Promise<User>;
}

class AuthenRepository implements IAuthenRepository { 
  async save(user: User) : Promise<User>{
    try {
      const isDuplicate = await VerifySignUp.checkDuplicateUsername(user.username);

      if (isDuplicate) {
        logging.error(NAMESPACE, 'Username is already taken.');
        throw 'Username is already taken.'; 
      }

      const result = await AppDataSource.getRepository(User).save(user);
      logging.info(NAMESPACE, 'User signed up successfully.');
      try {
        const res = await userRespository.retrieveByID(result.user_id);
        return res;
      }catch(err){
        logging.error(NAMESPACE, 'Error call retrieveByID from insert user');
        throw err;
      }
    } catch (err) {
      logging.error(NAMESPACE, 'Error during signup', err);
      throw err;
    }
  }
}

export default new AuthenRepository();
