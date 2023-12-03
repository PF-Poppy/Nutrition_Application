import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../entity/user.entity";
import { UserRole } from "../entity/userrole.entity"; 
import bcrypt from "bcrypt";
import userRepository from "../repositories/user.respository";
import roleRepository from "../repositories/role.respository";
import userRoleRepository from "../repositories/userrole.repository";
import authRepository from "../repositories/auth.repository";
import createJwtToken from "../middleware/createJwtToken";
import logging from "../config/logging";
import checkuserAdminrole from "../middleware/checkuser.adminrole";

const NAMESPACE = 'AuthController';

export default class AuthController {
    async signup(req: Request, res: Response) {
        logging.info(NAMESPACE, 'User signup');
        if (!req.body.username || !req.body.password) {
            res.status(400).send({
                message: "Requires a username password.!"
            });
            return;
        }
        console.log(req.body);
        const { firstname, lastname, age, username, password } = req.body;

        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                logging.error(NAMESPACE, (err as Error).message, err);
                res.status(500).send({
                    message: err.message
                });
            }
            try {
                const user = new User();
                user.firstname = firstname;
                user.lastname = lastname;
                user.age = age;
                user.username = username;
                user.password = hash;
                user.is_active = 1;
                user.update_date = new Date();
                user.generateUserId();
                
                const signup = await authRepository.save(user);
                
                const role = await roleRepository.retrieveByName("User");
                if (!role) {
                    logging.error(NAMESPACE, "Role not found!");
                    res.status(500).send({
                        message: "Role not found!"
                    });
                    return;
                }

                const userrole = new UserRole();
                userrole.user_user_id = signup.user_id;
                userrole.role_role_id = role.role_id!;
                userrole.update_date = new Date();
                try {
                    const result = await userRoleRepository.save(userrole);
                }catch (err) {
                    await userRepository.deleteByID(signup.user_id);
                    res.status(500).send({
                        message: err
                    });
                    return;
                }
                
                logging.info(NAMESPACE, "User registered successfully!");
                res.status(200).send({
                    message: "User registered successfully!"
                });
            }catch (err) {
                logging.error(NAMESPACE, (err as Error).message, err);
                res.status(500).send({
                    message: err
                });
            }
        });
    }

    async signin(req: Request, res: Response) {
        logging.info(NAMESPACE, 'User signin');
        if (!req.body.username || !req.body.password) {
            res.status(400).send({
                message: "Requires a username password.!"
            });
            return;
        }
        console.log(req.body);
        const { username, password } = req.body;
        try {
            const user = await userRepository.retrieveByName(username);
            if (!user) {
                logging.error(NAMESPACE, "User Not found!");
                res.status(404).send({
                    accessToken: null,
                    message: "User Not found!"
                });
                return;
            }
            const passwordIsValid = bcrypt.compareSync(
                password,
                user.password!
            );
            if (!passwordIsValid) {
                logging.error(NAMESPACE, "Invalid Password!");
                res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
                return;
            }
            const jwtPayload: JwtPayload = {
                userid: user.user_id,
                username: user.username,
            };
            const isPetFoodManagementAdmin = await checkuserAdminrole.checkPetFoodManagementAdmin(user.user_id);
            const isUserManagementAdmin = await checkuserAdminrole.checkUserManagementAdmin(user.user_id);
            const roleResult = {
                isUserManagementAmin: isUserManagementAdmin,
                isPetFoodManagementAmin: isPetFoodManagementAdmin
            };

            try {
                const token = createJwtToken.SignJWT(jwtPayload);
                res.status(200).send({
                    accessToken: (await token).valueOf(),
                    username: user.username,
                    userID: user.user_id,
                    userRole: roleResult
                });
            }catch (err) {
                logging.error(NAMESPACE, (err as Error).message, err);
                res.status(400).send({
                    accessToken: null,
                    message: "Token can't be created"
                });
            }

        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: err
            });
        }
    }
}