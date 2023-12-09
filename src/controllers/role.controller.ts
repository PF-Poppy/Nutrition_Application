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
            const result = await Promise.all(role.map(async (roleData: any) => {
                return {
                    roleTD: roleData.role_id,
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
        if (!req.body) {
            res.status(400).send({
                message: "Content can not be empty!"
            });
        }

        const { roleName } = req.body;
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
                message: "Content can not be empty!"
            });
        }
        const { roleID, roleName } = req.body;
        if (roleID == "" || roleID == null || roleID == undefined) {
            res.status(400).send({
                message: "Role ID can not be empty!"
            });
        }
        try {
            const role = new Role();
            role.role_id = roleID;
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
        if (req.params.roleID == ":roleID" || !req.params.roleID) {
            res.status(400).send({
                message: "Role ID can not be empty!"
            });
            return;
        }
        const roleID:number = parseInt(req.params.roleID);
        try {
            await roleRespository.deleteByID(roleID);
            await userroleRepository.deleteByRoleID(roleID);
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
