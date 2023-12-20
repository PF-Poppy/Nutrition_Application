//TODO แก้
import { Request, Response } from "express";
import { UserRole } from "../entity/userrole.entity";
import userroleRepository from "../repositories/userrole.repository";
import userRespository from "../repositories/user.respository";
import roleRepository from "../repositories/role.respository";
import logging from "../config/logging";

const NAMESPACE = "Userrole Controller";

export default class UserRoleController {
    //TODO ลบออกเอาไว้ทดสอบ
    async getUserRolesByName(req: Request, res: Response) {
        const name:string = req.params.username;
        try {
            try {
                const user = await userRespository.retrieveByName(name);
                const userrole = await userroleRepository.retrieveByUserId(user.user_id);
                if (userrole.length!=0){
                    const role = await Promise.all(userrole.map(async (userrole) => {
                        return {
                            rolename: userrole.role_name
                        }
                    }));
                    res.status(200).send({
                        username: user.username,
                        userId: user.user_id,
                        userRole: role
                    });
                }else{
                    res.status(404).send({
                    message: `The userrole of ${name} was not found.`
                    });
                }
            }catch (err) {
                throw new Error("User not found!");
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
            message: (err as Error).message
            });
        }
    }  

    async createUserRolefirsttime(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Create userrole');
        if (!req.body) {
            return res.status(400).send({
                message: "Content can not be empty!"
            });
        }
        const { username, rolename } = req.body;
        if (!username || !rolename) {
            res.status(400).send({
                message: "Please fill in all the fields!"
            });
            return;
        }
        try {
            try {
                const user = await userRespository.retrieveByName(username);
                try {
                    const role = await roleRepository.retrieveByName(rolename);
                        
                    const userrole = new UserRole();
                    userrole.user_user_id = user.user_id;
                    userrole.role_role_id = role.role_id;
                    userrole.update_date = new Date();
                    try {
                        const addnewuserrole = await userroleRepository.save(userrole);
                        logging.info(NAMESPACE, 'Insert UserRole successfully.');
                        res.status(200).send({
                            message: 'Insert UserRole successfully.',
                        });
                    }catch (err) {
                        throw new Error("Cannot create userrole!");
                    }
                }catch (err) {
                    throw new Error("Role not found!");
                }
            }catch (err) {
                throw new Error("User not found!");
            } 
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: (err as Error).message
            });
        }
    }
}
