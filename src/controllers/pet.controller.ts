import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Pet } from '../entity/pet.entity';
import { Disease } from '../entity/disease.entity';
import petRepository from '../repositories/pet.repository';
import animaltypeRespository from '../repositories/animaltype.respository';
import diseaseRepository from '../repositories/disease.repository';
import logging from '../config/logging';
import { differenceInDays } from 'date-fns';

const NAMESPACE = 'Pet Controller';

export default class PetController {
    async getPetProfile(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Get pet profile');
        const { userid, username} = (req as JwtPayload).jwtPayload;
        const currentDay = new Date();
        try {
            const pet = await petRepository.retrieveByUserID(userid);

            const petInfo = await Promise.all(pet.map(async (petData: Pet) => {
                const disease = await diseaseRepository.retrieveByPetID(petData.pet_id);
                const animaltype = await animaltypeRespository.retrieveByID(petData.animaltype_type_id);

                const chronicDisease = await Promise.all(disease.map(async (diseaseData: any) => {
                    return {
                        petChronicDiseaseId: (diseaseData.diseasedetailid).toString(),
                        petChronicDiseaseName: diseaseData.diseasename,
                    }
                }));
                return {
                    petID: (petData.pet_id).toString(),
                    petName: petData.pet_name,
                    petType: animaltype.type_name,
                    factorType: petData.factor_type,
                    petFactorNumber: petData.factor_number,
                    petWeight: petData.weight,
                    petNeuteringStatus: petData.neutering_status,
                    petAgeType: petData.age,
                    petPhysiologyStatus: petData.physiology_status,
                    petChronicDiseaseForUser: chronicDisease,
                    petActivityType: petData.activitie,
                    updateRecent: differenceInDays(currentDay, petData.update_date!)
                } 
            }));
            const result = {
                username: username,
                userID: userid,
                petList: petInfo
            }

            logging.info(NAMESPACE, 'Get pet profile successfully');
            res.status(200).send(result);
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: "Some error occurred while get pet profile."
            });
        }
        
    }
    
    async addNewPet(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Add new pet');
        const { userid } = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).send({
                message: 'Content can not be empty!'
            });
            return;
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
                disease.diseasedetail_disease_id = parseInt(diseaseData.petChronicDiseaseId);
                disease.update_date = new Date();
                try {
                    const addnewpetdisease = await diseaseRepository.save(disease);
                    return;
                }catch (err) {
                    await petRepository.deleteByID(addpet.pet_id);
                    await diseaseRepository.deleteByPetID(addpet.pet_id);
                    throw err;
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

    async updatePet(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Update pet');
        const { userid } = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).send({
                message: 'Content can not be empty!'
            });
            return;
        }
        const { petID, petName, petType, factorType, petFactorNumber, petWeight, petNeuteringStatus, petAgeType, petPhysiologyStatus, petChronicDiseaseForUser, petActivityType} = req.body;
        if (petID === "" || petID === undefined || petID === null) {
            res.status(400).send({
                message: 'Pet ID can not be empty!'
            });
            return;
        }
        try {
            const animaltype = await animaltypeRespository.retrieveByName(petType);
            const pet = new Pet();
            pet.pet_id = parseInt(petID);
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
            const updatepet = await petRepository.update(pet);

            pet.disease = await Promise.all(petChronicDiseaseForUser.map(async (diseaseData: any) => {
                const disease = new Disease();
                disease.pet_pet_id = updatepet.pet_id;
                disease.diseasedetail_disease_id = parseInt(diseaseData.petChronicDiseaseId);
                disease.update_date = new Date();
                try {
                    const updatepetdisease = await diseaseRepository.update(disease);
                    return;
                }catch (err) {
                    throw err;
                }
            }));
            logging.info(NAMESPACE, 'Update pet successfully');
            res.status(200).send({
                message: 'Update pet successfully',
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: "Some error occurred while update the pet."
            });
        }
    }

    async deletePet(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Delete pet');
        if (req.params.petProfileId === ":petProfileId" || !req.params.petProfileId) {
            res.status(400).send({
                message: 'Pet ID can not be empty!'
            });
            return;
        }
        const petID:number = parseInt(req.params.petProfileId);

        try {
            const pet = await petRepository.retrieveByID(petID);
            if (!pet) {
                res.status(404).send({
                    message: `Not found pet with id=${petID}.`
                });
                return;
            }
            await diseaseRepository.deleteByPetID(petID);
            await petRepository.deleteByID(petID);
            logging.info(NAMESPACE, 'Delete pet successfully');
            res.status(200).send({
                message: 'Delete pet successfully',
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: `Could not delete pet with id=${petID}.`
            });
        }
    }
}