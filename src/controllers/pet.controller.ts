//TODO ทำเพิ่ม
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import petRepository from '../repositories/pet.repository';
import logging from '../config/logging';

const NAMESPACE = 'Pet Controller';

export default class PetController {
    
    async addNewPet(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Add new pet');
        const { userid } = (req as JwtPayload).jwtPayload;
        res.status(200).send({
            message: req.body
        });
    }
}