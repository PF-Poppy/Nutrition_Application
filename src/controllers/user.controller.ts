//TODO แก้
import { Request, Response } from "express";
import userRespository from "../repositories/user.respository";
import logging from "../config/logging";

const NAMESPACE = "User Controller";

export default class AnimalController {
    async getUserById(req: Request, res: Response) {
        const id:string = req.params.id;
        try {
            const result = await userRespository.retrieveById(id);
            if (result) res.status(200).json(result);
            else
                res.status(404).json({
                message: `Cannot find User with id=${id}.`
            });
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
            message: `Error retrieving User with id=${id}.`
            });
        }
    }  
}
