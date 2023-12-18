//TODO แก้
import { Request, Response } from "express";
import userroleRepository from "../repositories/userrole.repository";
import logging from "../config/logging";

const NAMESPACE = "Userrole Controller";

export default class AnimalController {
    async getUserRolesById(req: Request, res: Response) {
        const id:string = req.params.id;
        try {
            const result = await userroleRepository.retrieveById(id);
            if (result.length!=0) res.status(200).send(result);
            else
                res.status(404).send({
                message: `Cannot find Userrole with id=${id}.`
            });
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
            message: `Error retrieving Userrole with id=${id}.`
            });
        }
    }  
}
