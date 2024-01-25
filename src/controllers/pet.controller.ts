import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { differenceInDays } from 'date-fns';
import { Pet } from '../entity/pet.entity';
import { Disease } from '../entity/disease.entity';
import { Profilepet } from '../entity/profilepet.entity';
import petRepository from '../repositories/pet.repository';
import profilepetRepository from '../repositories/profilepet.repository';
import diseaseRepository from '../repositories/disease.repository';
import diseasedetailRepository from '../repositories/diseasedetail.repository';
import logging from '../config/logging';


const NAMESPACE = 'Pet Controller';

export default class PetController {
    async getPetProfile(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Get pet profile');
        const { userid, username} = (req as JwtPayload).jwtPayload;
        const currentDay = new Date();
        try {
            const pet = await petRepository.retrieveByUserId(userid);

            const petInfo = await Promise.all(pet.map(async (petData: any) => {
                const profile = await profilepetRepository.retrieveByPetId(petData.petid);
                const disease = await diseaseRepository.retrieveByPetId(petData.petid);

                const chronicDisease = await Promise.all(disease.map(async (diseaseData: any) => {
                    return {
                        petChronicDiseaseId: diseaseData.diseasedetailid,
                        petChronicDiseaseName: diseaseData.diseasename,
                    }
                }));
                return {
                    petId: petData.petid,
                    petName: petData.petname,
                    petType: petData.animaltypename,
                    petTypeId: petData.animaltypeid,
                    factorType: profile.factor_type,
                    petFactorNumber: profile.factor_number,
                    petWeight: profile.weight,
                    petNeuteringStatus: profile.neutering_status,
                    petBirthDate: profile.petBirthDate,
                    petPhysiologyStatus: profile.physiology_status,
                    petChronicDiseaseForUser: chronicDisease,
                    petActivityType: profile.activitie,
                    updateRecent: differenceInDays(currentDay, petData.updatedate!)
                } 
            }));
            const result = {
                username: username,
                userId: userid,
                petList: petInfo
            }

            logging.info(NAMESPACE, 'Get pet profile successfully');
            res.status(200).json(result);
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
                message: "Some error occurred while get pet profile."
            });
        }
        
    }
    
    async addNewPet(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Add new pet');
        const { userid } = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).json({
                message: 'Content can not be empty!'
            });
            return;
        }
        const { petName, petTypeId, factorType, petFactorNumber, petWeight, petNeuteringStatus, petBirthDate, petPhysiologyStatus, petChronicDiseaseForUser, petActivityType} = req.body;
        if (!petName || !petTypeId || !factorType || !petFactorNumber || !petWeight || !petNeuteringStatus || !petBirthDate || !petPhysiologyStatus || !petChronicDiseaseForUser || !petActivityType) {
            res.status(400).json({
                message: "Please fill in all the fields!"
            });
            return;
        }
        try {
            const pet = new Pet();
            pet.user_user_id = userid;
            pet.animaltype_type_id = petTypeId;
            pet.pet_name = petName;
            pet.update_date = new Date();
            const addpet = await petRepository.save(pet);
            try {
                const profile = new Profilepet();
                profile.pet_pet_id = addpet.petid;
                profile.weight = petWeight;
                profile.neutering_status = petNeuteringStatus;
                profile.petBirthDate = petBirthDate;
                profile.activitie = petActivityType;
                profile.factor_type = factorType;
                profile.factor_number = petFactorNumber;
                profile.physiology_status = petPhysiologyStatus;
                profile.update_date = new Date();
                const addprofile = await profilepetRepository.save(profile);
            }catch (err) {
                await petRepository.deleteById(addpet.pet_id);
                throw err;
            }

            pet.disease = await Promise.all(petChronicDiseaseForUser.map(async (diseaseData: any) => {
                if (!diseaseData.petChronicDiseaseId || !diseaseData.petChronicDiseaseName) {
                    await petRepository.deleteById(addpet.pet_id);
                    throw new Error("Please fill in all the fields!");
                }
                try{
                    const animaldiscease = await diseasedetailRepository.retrieveByTypeAndDiseaseId(petTypeId, diseaseData.petChronicDiseaseId);

                    const disease = new Disease();
                    disease.pet_pet_id = addpet.petid;
                    disease.diseasedetail_disease_id = diseaseData.petChronicDiseaseId;
                    disease.update_date = new Date();
                    try {
                        const addnewpetdisease = await diseaseRepository.save(disease);
                        return;
                    }catch (err) {
                        throw err;
                    }
                }catch (err) {
                    await petRepository.deleteById(addpet.pet_id);
                    throw err;
                }
            }));
            logging.info(NAMESPACE, 'Add new pet successfully');
            res.status(200).json({
                message: 'Add new pet successfully',
            });
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            if ( (err as Error).message === "Please fill in all the fields!" ) {
                res.status(400).json({
                    message: (err as Error).message
                });
                return;
            }else {
                res.status(500).json({
                    message: "Some error occurred while creating animal."
                });
                return;
            }
        }
    }

    async updatePet(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Update pet');
        const { userid } = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).json({
                message: 'Content can not be empty!'
            });
            return;
        }
        const { petId, petName, petTypeId, factorType, petFactorNumber, petWeight, petNeuteringStatus, petBirthDate, petPhysiologyStatus, petChronicDiseaseForUser, petActivityType} = req.body;
        if (petId === "" || petId === undefined || petId === null) {
            res.status(400).json({
                message: 'Pet Id can not be empty!'
            });
            return;
        }
        if (!petName || !petTypeId || !factorType || !petFactorNumber || !petWeight || !petNeuteringStatus || !petBirthDate || !petPhysiologyStatus || !petChronicDiseaseForUser || !petActivityType) {
            res.status(400).json({
                message: "Please fill in all the fields!"
            });
            return;
        }

        try {
            const pet = await petRepository.retrieveById(petId);
        }catch(err){
            res.status(404).json({
                message: `Not found pet with id=${petId}.`
            });
            return;
        }

        try {
            const pet = new Pet();
            pet.pet_id = petId;
            pet.user_user_id = userid;
            pet.animaltype_type_id = petTypeId;
            pet.pet_name = petName;
            pet.update_date = new Date();
            const updatepet = await petRepository.update(pet);
            console.log(updatepet);

            try {
                const profile = new Profilepet();
                profile.pet_pet_id = petId;
                profile.weight = petWeight;
                profile.neutering_status = petNeuteringStatus;
                profile.petBirthDate = petBirthDate;
                profile.activitie = petActivityType;
                profile.factor_type = factorType;
                profile.factor_number = petFactorNumber;
                profile.physiology_status = petPhysiologyStatus;
                profile.update_date = new Date();
                const updateprofile = await profilepetRepository.update(profile);

            }catch (err) {
                throw err;
            }
        
            pet.disease = await Promise.all(petChronicDiseaseForUser.map(async (diseaseData: any) => {
                if (!diseaseData.petChronicDiseaseId || !diseaseData.petChronicDiseaseName) {
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const animaldiscease = await diseasedetailRepository.retrieveByTypeAndDiseaseId(petTypeId, diseaseData.petChronicDiseaseId);
                }catch (err) {
                    throw err;
                }
            }));

            pet.disease = await Promise.all(petChronicDiseaseForUser.map(async (diseaseData: any) => {
                const disease = new Disease();
                disease.pet_pet_id = petId;
                disease.diseasedetail_disease_id = diseaseData.petChronicDiseaseId;
                disease.update_date = new Date();
                
                try {
                    const updatepetdisease = await diseaseRepository.update(disease);
                    return;
                }catch (err) {
                    throw err;
                }
            }));
            logging.info(NAMESPACE, 'Update pet successfully');
            res.status(200).json({
                message: 'Update pet successfully',
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
                message: "Some error occurred while update the pet."
            });
        }
    }

    async deletePet(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Delete pet');
        if (req.params.petProfileId === ":petProfileId" || !req.params.petProfileId) {
            res.status(400).json({
                message: 'Pet Id can not be empty!'
            });
            return;
        }
        const petId:string = req.params.petProfileId;

        try {
            const pet = await petRepository.retrieveById(petId);
        }catch(err){
            res.status(404).json({
                message: `Not found pet with id=${petId}.`
            });
            return;
        }

        try {
            await petRepository.deleteById(petId);
            logging.info(NAMESPACE, 'Delete pet successfully');
            res.status(200).json({
                message: 'Delete pet successfully',
            });
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
                message: `Could not delete pet with id=${petId}.`
            });
        }
    }
}