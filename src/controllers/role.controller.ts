//TODO ทำเพิ่ม
import { Request, Response } from "express";
import roleRespository from "../repositories/role.respository";
import logging from "../config/logging";

const NAMESPACE = "Role Controller";

export default class RoleController {
    async getRoleByName(req: Request, res: Response) {
        const name:string = req.params.name;
        try {
            const result = await roleRespository.retrieveByName(name);
            if (result) res.status(200).send(result);
            else
                res.status(404).send({
                message: `Cannot find Role with id=${name}.`
            });
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
            message: `Error retrieving Role with id=${name}.`
            });
        }
    }  
}
