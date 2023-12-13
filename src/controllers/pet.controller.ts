import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Pet } from '../entity/pet.entity';
import { Disease } from '../entity/disease.entity';
import petRepository from '../repositories/pet.repository';
import animaltypeRespository from '../repositories/animaltype.respository';
import diseaseRepository from '../repositories/disease.repository';
import logging from '../config/logging';

const NAMESPACE = 'Pet Controller';

export default class PetController {
    
    async addNewPet(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Add new pet');
        const { userid, username } = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).send({
                message: 'Content can not be empty!'
            });
        }

        const { petName, petType, factorType, petFactorNumber, petWeight, petNeuteringStatus, petAgeType, petPhysiologyStatus, petChronicDiseaseForUser, petActivityType} = req.body;
        try {
            const animaltype = await animaltypeRespository.retrieveByName(petType);
            const pet = new Pet();
            pet.user_user_id = userid;
            pet.animaltype_type_id = animaltype.type_id;
            pet.pet_name = petName;
            pet.weight = petWeight;
            pet.neutering_status = petNeuteringStatus;
            pet.age = petAgeType;
            pet.activitie = petActivityType;
            pet.factor_type = factorType;
            pet.factor_number = petFactorNumber;
            pet.physiology_status = petPhysiologyStatus;
            pet.update_date = new Date();
            const addpet = await petRepository.save(pet);

            pet.disease = await Promise.all(petChronicDiseaseForUser.map(async (diseaseData: any) => {
                const disease = new Disease();
                disease.pet_pet_id = addpet.pet_id;
                disease.diseasedetail_disease_id = diseaseData.petChronicDiseaseId;
                disease.update_date = new Date();
                try {
                    //const addnewpethealth = 
                }catch (err) {

                }
            }));

            logging.info(NAMESPACE, 'Add new pet successfully');
            res.status(200).send({
                message: 'Add new pet successfully',
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: "Some error occurred while creating the pet."
            });
        }
    }
}