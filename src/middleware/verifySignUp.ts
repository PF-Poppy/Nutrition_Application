import { User } from '../entity/user.entity';
import { AppDataSource } from '../db/data-source';
import logging from '../config/logging';

const NAMESPACE = 'VerifySignUp';

interface IVerifySignUp {
  checkDuplicateUsername(username: string): Promise<boolean>;
}

class VerifySignUp implements IVerifySignUp {
  async checkDuplicateUsername(username: string): Promise<boolean> {
    logging.info(NAMESPACE, 'Checking duplicate username...');
    try {
      const user = await AppDataSource.getRepository(User).find(
        { where: { username: username } }
      );
      if (user.length > 0) {
        return true; 
      } else {
        return false; 
      }
    } catch (error) {
      logging.error(NAMESPACE, 'Error checking duplicate username', error);
      throw error; 
    }
  }
}

export default new VerifySignUp();