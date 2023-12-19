import { Request, Response } from "express";
import { Role } from "../entity/role.entity";
import roleRespository from "../repositories/role.respository";
import userroleRepository from "../repositories/userrole.repository";
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
            res.status(200).send(result);
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: err
            })
        }
    }

    async addNewRole(req: Request, res: Response) {
        logging.info(NAMESPACE, "Add new role");
        const { userid, username } = (req as any).jwtPayload;
        const { roleName } = req.body;
        if (!roleName) {
            res.status(400).send({
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
            res.status(200).send({
                message: "Add new role successfully."
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: err
            });
        }
    }

    async updateRole(req: Request, res: Response) {
        logging.info(NAMESPACE, "Update role");
        const { userid, username } = (req as any).jwtPayload;
        if (!req.body) {
            res.status(400).send({
                message: 'Content can not be empty!'
            });
            return;
        }
        const { roleId, roleName } = req.body;
        if (roleId == "" || roleId == null || roleId == undefined) {
            res.status(400).send({
                message: "Role Id can not be empty!"
            });
        }
        if (!roleName) {
            res.status(400).send({
                message: "Please fill in all the fields!"
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
            res.status(200).send({
                message: "Update role successfully."
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: err
            });
        }
    }
    
    async deleteRole(req: Request, res: Response) {
        logging.info(NAMESPACE, "Delete role");
        if (req.params.roleId == ":roleId" || !req.params.roleId) {
            res.status(400).send({
                message: "Role Id can not be empty!"
            });
            return;
        }
        const roleId:string = req.params.roleId;
        
        try {
            const role = await roleRespository.retrieveById(roleId);
            if (!role) {
                res.status(404).send({
                    message: `Not found role with id=${roleId}.`
                });
                return;
            }
            await userroleRepository.deleteByRoleId(roleId);
            await roleRespository.deleteById(roleId);
            logging.info(NAMESPACE, "Delete role successfully.");
            res.status(200).send({
                message: "Delete role successfully."
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: err
            });
        }
    }
}
