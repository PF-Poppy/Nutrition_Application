import { Request, Response } from "express";
import { Role } from "../entity/role.entity";
import roleRespository from "../repositories/role.respository";
import logging from "../config/logging";

const NAMESPACE = "Role Controller";

export default class RoleController {
    async getAllRole(req: Request, res: Response) {
        logging.info(NAMESPACE, "Get all role");
        try {
            const role = await roleRespository.retrieveAll();
            const result = await Promise.all(role.map(async (roleData: Role) => {
                return {
                    roleId: roleData.role_id.toString(),
                    roleName: roleData.role_name
                }
            }));
            logging.info(NAMESPACE, "Get all role successfully.");
            res.status(200).json(result);
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
                message: (err as Error).message
            })
        }
    }

    async addNewRolefirsttime(req: Request, res: Response) {
        logging.info(NAMESPACE, "Add new role first time");
        const { roleName } = req.body;
        if (!roleName) {
            res.status(400).json({
                message: "Please fill in all the fields!"
            });
            return;
        }
        try {
            const role = new Role();
            role.role_name = roleName;
            role.update_date = new Date();
            const addeole = await roleRespository.save(role);
            logging.info(NAMESPACE, "Add new role successfully.");
            res.status(200).json({
                message: "Add new role successfully."
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
                message: (err as Error).message
            });
        }
    }


    async addNewRole(req: Request, res: Response) {
        logging.info(NAMESPACE, "Add new role");
        const { userid, username } = (req as any).jwtPayload;
        const { roleName } = req.body;
        if (!roleName) {
            res.status(400).json({
                message: "Please fill in all the fields!"
            });
            return;
        }
        try {
            const role = new Role();
            role.role_name = roleName;
            role.update_date = new Date();
            role.create_by = `${userid}_${username}`;
            role.update_by = `${userid}_${username}`;
            const addeole = await roleRespository.save(role);
            logging.info(NAMESPACE, "Add new role successfully.");
            res.status(200).json({
                message: "Add new role successfully."
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
                message: (err as Error).message
            });
        }
    }

    async updateRole(req: Request, res: Response) {
        logging.info(NAMESPACE, "Update role");
        const { userid, username } = (req as any).jwtPayload;
        if (!req.body) {
            res.status(400).json({
                message: 'Content can not be empty!'
            });
            return;
        }
        const { roleId, roleName } = req.body;
        if (roleId == "" || roleId == null || roleId == undefined) {
            res.status(400).json({
                message: "Role Id can not be empty!"
            });
        }
        if (!roleName) {
            res.status(400).json({
                message: "Please fill in all the fields!"
            });
            return;
        }

        try {
            const role = await roleRespository.retrieveById(roleId);
        }catch(err){   
            res.status(404).json({
                message: `Not found role with id=${roleId}.`
            });
            return;
        }
        
        try {
            const role = new Role();
            role.role_id = roleId;
            role.role_name = roleName;
            role.update_date = new Date();
            role.update_by = `${userid}_${username}`;
            const updaterole = await roleRespository.update(role);
            logging.info(NAMESPACE, "Update role successfully.");
            res.status(200).json({
                message: "Update role successfully."
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
                message: (err as Error).message
            });
        }
    }
    
    async deleteRole(req: Request, res: Response) {
        logging.info(NAMESPACE, "Delete role");
        if (req.params.roleId == ":roleId" || !req.params.roleId) {
            res.status(400).json({
                message: "Role Id can not be empty!"
            });
            return;
        }
        const roleId:string = req.params.roleId;

        try {
            const role = await roleRespository.retrieveById(roleId);
        }catch(err){
            res.status(404).json({
                message: `Not found role with id=${roleId}.`
            });
            return;
        }
        
        try {
            await roleRespository.deleteById(roleId);
            logging.info(NAMESPACE, "Delete role successfully.");
            res.status(200).json({
                message: "Delete role successfully."
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
                message: (err as Error).message
            });
        }
    }
}
