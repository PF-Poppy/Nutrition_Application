import { Request, Response, NextFunction } from "express";
import jwt, {JwtPayload} from "jsonwebtoken";
import config from "../config/auth.config";
import checkuserAdminrole from "./checkuser.adminrole";
import createJwtToken from "./createJwtToken";
import logging from "../config/logging";

const NAMESPACE = 'Auth';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, 'Token validated, user authorized');
  const headerToken = req.headers["authorization"];
  console.log(headerToken);

  if (headerToken != undefined && headerToken.startsWith("Bearer ")) {
    const bearerToken = headerToken.split(" ")[1];
    let jwtPayload: { [key: string]: any };
    try {
      jwtPayload = jwt.verify(bearerToken, config.secret) as { [key: string]: any };
      ['iat', 'exp'].forEach((keyToRemove) => delete jwtPayload[keyToRemove]);
      (req as JwtPayload).jwtPayload = jwtPayload as JwtPayload;
      // Refresh token if it's about to expire
      const currentTime = Math.floor(Date.now() / 1000);
      const tokenExp = jwtPayload.exp;
      const refreshThreshold = 5 * 60;
      if (tokenExp - currentTime <= refreshThreshold) {
        try {
          const newToken = createJwtToken.SignJWT(jwtPayload as JwtPayload);
          res.setHeader('token', `Bearer ${newToken}`);
        } catch (err) {
          logging.error(NAMESPACE, (err as Error).message, err);
          return res.status(403).send({
            message: "Token can't be created"
          });
        }
      }
      
      next();
    } catch (err) { 
      logging.error(NAMESPACE, (err as Error).message, err);
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
  } else {    
    res.status(402).send({
      message: "No token provided!"
    });
  }
}


const isUserManagementAdmin = async (req: Request, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, 'Check User Management Admin Role');
  const { userid } = (req as JwtPayload).jwtPayload;
  const isUserManagementAdmin = await checkuserAdminrole.checkUserManagementAdmin(userid);
  if (isUserManagementAdmin) {
      next();
      return;
  }else {
    logging.error(NAMESPACE, 'User is not User Management Admin');
    res.status(404).send({
        message: "Require User Management Admin Role!"
    });
    return;
  }
}

const isPetFoodManagementAdmin = async (req: Request, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, 'Check Pet Food Management Admin Role');
  const { userid } = (req as JwtPayload).jwtPayload;
  const isPetFoodManagementAdmin = await checkuserAdminrole.checkPetFoodManagementAdmin(userid);
  if (isPetFoodManagementAdmin) {
      next();
      return;
  }else {
    logging.error(NAMESPACE, 'User is not Pet Food Management Admin');
    res.status(404).send({
        message: "Require Pet Food Management Admin Role!"
    });
    return;
  }
}


const authJwt = {
    validateToken,
    isUserManagementAdmin,
    isPetFoodManagementAdmin
};

export default authJwt;