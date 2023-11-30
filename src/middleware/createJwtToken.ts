import jwt,{ JwtPayload } from 'jsonwebtoken';
import authConfig from '../config/auth.config';
import logging from '../config/logging';

const NAMESPACE = 'createJwtToken';

interface ICreateJwtToken {
    SignJWT(payload: JwtPayload): Promise<string>;
}

class CreateJwtToken implements ICreateJwtToken {
    async SignJWT(payload: JwtPayload): Promise<string> {
        try {
            return jwt.sign(payload, authConfig.secret, { 
                issuer: authConfig.issure,
                algorithm: "HS256",
                expiresIn: authConfig.expiresTime, 
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
        
      
    }
}
export default new CreateJwtToken();