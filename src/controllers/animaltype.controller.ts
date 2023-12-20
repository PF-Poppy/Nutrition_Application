import { Request, Response } from "express";
import { JwtPayload } from 'jsonwebtoken';
import { AnimalType } from "../entity/animaltype.entity";
import { Diseasedetail } from "../entity/diseasedetail.entity";
import { Diseasenutrition } from "../entity/diseasenutrition.entity";
import petRepository from "../repositories/pet.repository";
import nutritionRepository from "../repositories/nutrition.repository";
import animalRepository from "../repositories/animaltype.respository";
import diseaseRepository from "../repositories/disease.repository";
import diseasedetailRepository from "../repositories/diseasedetail.repository";
import diseasenutritionRepository from "../repositories/diseasenutrition.repository";
import logging from "../config/logging";


const NAMESPACE = "AnimalType Controller";

export default class AnimalController {
    async getAllAnimalType(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Get all animal type');
        try {
            const animaltype = await animalRepository.retrieveAll();

            const result = await Promise.all(animaltype.map(async (animaltypeData: AnimalType) => {
                const diseasedetail = await diseasedetailRepository.retrieveByAnimalTypeId(animaltypeData.type_id);

                const chronicDisease = await Promise.all(diseasedetail.map(async (diseasedetailData: Diseasedetail) => {
                    const diseasenutrition = await diseasenutritionRepository.retrieveByDiseaseId(diseasedetailData.disease_id);

                    const nutrientlimitinfo = await Promise.all(diseasenutrition.map(async (diseasenutritionData: any) => {
                        return {
                            nutrientName: diseasenutritionData.nutrient_name,
                            min: diseasenutritionData.value_min,
                            max: diseasenutritionData.value_max
                        };
                    }));
                    
                    return {
                        petChronicDiseaseId: diseasedetailData.disease_id,
                        petChronicDiseaseName: diseasedetailData.disease_name,
                        NutrientLimitInfo: nutrientlimitinfo
                    };
                }));
                
                return {
                    petTypeId: animaltypeData.type_id,
                    petTypeName: animaltypeData.type_name,
                    petChronicDisease: chronicDisease
                };
            }));
            logging.info(NAMESPACE, "Get all animal type successfully.");
            res.status(200).send(result);
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: "Some error occurred while retrieving animal."
            });
        }
    }
    
    async getAllAnimalTypeForNormalUser(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Get all animal type for normal user');
        try {
            const animaltype = await animalRepository.retrieveAll();
            
            const result = await Promise.all(animaltype.map(async (animaltypeData: AnimalType) => {
                const diseasedetail = await diseasedetailRepository.retrieveByAnimalTypeId(animaltypeData.type_id);
                
                const chronicDisease = await Promise.all(diseasedetail.map(async (diseasedetailData: Diseasedetail) => {
                    return {
                        petChronicDiseaseId: diseasedetailData.disease_id,
                        petChronicDiseaseName: diseasedetailData.disease_name
                    }
                }));
                return {
                    petTypeId: animaltypeData.type_id,
                    petTypeName: animaltypeData.type_name,
                    petChronicDiseaseForUser: chronicDisease
                }
            }));
            logging.info(NAMESPACE, "Get all animal type for normal user successfully.");
            res.status(200).send(result);
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: "Some error occurred while retrieving animal."
            });
        }
    }

    async addNewAnimalType(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Add new animal type');
        if (!req.body) {
            res.status(400).send({
                message: 'Content can not be empty!'
            });
            return;
        }
        const { userid, username } = (req as JwtPayload).jwtPayload;
        const { petTypeName, petChronicDisease} = req.body;
        if (!petTypeName || !petChronicDisease) {
            res.status(400).send({
                message: "Please fill in all the fields!"
            });
            return;
        }
        try {
            const animaltype = new AnimalType();
            animaltype.type_name = petTypeName;
            animaltype.create_by = `${userid}_${username}`;
            animaltype.update_date = new Date();
            animaltype.update_by = `${userid}_${username}`;
            const addanimaltype = await animalRepository.save(animaltype);

            animaltype.diseasedetail = await Promise.all(petChronicDisease.map(async (diseaseData: any) => {
                if (!diseaseData.petChronicDiseaseName || !diseaseData.NutrientLimitInfo) {
                    await diseasedetailRepository.deleteByAnimalTypeId(addanimaltype.type_id);
                    await animalRepository.deleteById(addanimaltype.type_id);
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const chronicDisease = new Diseasedetail();
                    chronicDisease.disease_name = diseaseData.petChronicDiseaseName;
                    chronicDisease.animaltype_type_id = addanimaltype.type_id;
                    chronicDisease.create_by = `${userid}_${username}`;
                    chronicDisease.update_by = `${userid}_${username}`;
                    chronicDisease.update_date = new Date();
                    const addnewdiseasedetail = await diseasedetailRepository.save(chronicDisease);
                    
                    chronicDisease.diseasenutrition = await Promise.all(diseaseData.NutrientLimitInfo.map(async (nutrientInfoData: any) => {
                        if (!nutrientInfoData.nutrientName || !nutrientInfoData.min || !nutrientInfoData.max) {
                            await diseasedetailRepository.deleteById(addnewdiseasedetail.disease_id);
                            throw new Error("Please fill in all the fields!");
                        }
                        try {
                            const nutrient = await nutritionRepository.retrieveByName(nutrientInfoData.nutrientName);

                            const nutrientInfo = new Diseasenutrition();
                            nutrientInfo.diseasedetail_disease_id = addnewdiseasedetail.disease_id;
                            nutrientInfo.nutrition_nutrition_id = nutrient!.nutrition_id;
                            nutrientInfo.value_min = nutrientInfoData.min;
                            nutrientInfo.value_max = nutrientInfoData.max;
                            nutrientInfo.create_by = `${userid}_${username}`;
                            nutrientInfo.update_by = `${userid}_${username}`;
                            nutrientInfo.update_date = new Date();
                            try {
                                const addnewdiseasenutrition = await diseasenutritionRepository.save(nutrientInfo);
                                return;
                            }catch(err){
                                throw err;
                            }
                        }catch(err){
                            await diseasenutritionRepository.deleteByDiseaseId(addnewdiseasedetail.disease_id);
                            throw err;
                        }
                    }));
                }catch(err){
                    await diseasedetailRepository.deleteByAnimalTypeId(addanimaltype.type_id);
                    await animalRepository.deleteById(addanimaltype.type_id);
                    throw err;
                }
                return;
            }));
            logging.info(NAMESPACE, "Create animal type successfully.");
            res.status(200).send({
                message: "Add Animal successfully!"
            });
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            if ( (err as Error).message === "Please fill in all the fields!" ) {
                res.status(400).send({
                    message: (err as Error).message
                });
                return;
            }else {
                res.status(500).send({
                    message: "Some error occurred while creating animal."
                });
                return;
            }
        }
    }

    async updateAnimalType(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Update animal type');
        const { userid, username } = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).send({
              message: "Content can not be empty!"
            });
            return;
        }
        const { petTypeId, petTypeName, petChronicDisease} = req.body;
        if (petTypeId === "" || petTypeId === null || petTypeId === undefined) {
            res.status(400).send({
              message: "Pet type id can not be empty!"
            });
            return;
        }
        if (!petTypeName || !petChronicDisease) {
            res.status(400).send({
                message: "Please fill in all the fields!"
            });
            return;
        }
        try {

            const animaltype = new AnimalType();
            animaltype.type_id = petTypeId;
            animaltype.type_name = petTypeName;
            animaltype.update_date = new Date();
            animaltype.update_by = `${userid}_${username}`;
            const updateanimaltype = await animalRepository.update(animaltype);

            animaltype.diseasedetail = await Promise.all(petChronicDisease.map(async (diseaseData: any) => {
                if (diseaseData.petChronicDiseaseId === "") {
                    if (!diseaseData.petChronicDiseaseName || !diseaseData.NutrientLimitInfo) {
                        throw new Error("Please fill in all the fields!");
                    }
                }else {
                    if (!diseaseData.petChronicDiseaseId || !diseaseData.NutrientLimitInfo) {
                        throw new Error("Please fill in all the fields!");
                    }
                }
                await Promise.all(diseaseData.NutrientLimitInfo.map(async (nutrientInfoData: any) => {
                    if (!nutrientInfoData.nutrientName || !nutrientInfoData.min || !nutrientInfoData.max) {
                        throw new Error("Please fill in all the fields!");
                    }
                    try {
                        const nutrient = await nutritionRepository.retrieveByName(nutrientInfoData.nutrientName);
                    }catch(err){
                        throw err;
                    }
                }));
            }));

            animaltype.diseasedetail = await Promise.all(petChronicDisease.map(async (diseaseData: any) => {
                const chronicDisease = new Diseasedetail();
                chronicDisease.disease_name = diseaseData.petChronicDiseaseName;
                chronicDisease.animaltype_type_id = petTypeId;
                chronicDisease.update_by = `${userid}_${username}`;
                chronicDisease.update_date = new Date();
                try {
                    let updatediseasedetail: Diseasedetail;
                    if (diseaseData.petChronicDiseaseId === "") {
                        chronicDisease.create_by = `${userid}_${username}`;
                        updatediseasedetail = await diseasedetailRepository.save(chronicDisease);
                    }else{
                        chronicDisease.disease_id = diseaseData.petChronicDiseaseId;
                        updatediseasedetail = await diseasedetailRepository.update(chronicDisease);
                    }
                    
                    chronicDisease.diseasenutrition = await Promise.all(diseaseData.NutrientLimitInfo.map(async (nutrientInfoData: any) => {
                        try {
                            const nutrient = await nutritionRepository.retrieveByName(nutrientInfoData.nutrientName);

                            const nutrientInfo = new Diseasenutrition();
                            nutrientInfo.diseasedetail_disease_id = updatediseasedetail.disease_id;
                            nutrientInfo.nutrition_nutrition_id = nutrient!.nutrition_id;
                            nutrientInfo.value_min = nutrientInfoData.min;
                            nutrientInfo.value_max = nutrientInfoData.max;
                            nutrientInfo.update_by = `${userid}_${username}`;
                            nutrientInfo.update_date = new Date();

                            const updatediseasenutrition = await diseasenutritionRepository.update(nutrientInfo);
                            return;
                        }catch(err){
                            throw err;
                        }
                    }));
                }catch(err){
                    throw err;
                }
                return;
            }));
            logging.info(NAMESPACE, "Update animal type successfully.");
            res.status(200).send({
                message: "Update Animal successfully!"
            });
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            if ( (err as Error).message === "Please fill in all the fields!" ) {
                res.status(400).send({
                    message: (err as Error).message
                });
                return;
            }else {
                res.status(500).send({
                    message: "Some error occurred while update animal."
                });
                return;
            }
        }
    }

    async deleteAnimalType(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Delete animal type');
        if (req.params.petTypeInfoId === ":petTypeInfoId" || !req.params.petTypeInfoId) {
            res.status(400).send({
                message: "Pet type id can not be empty!"
            });
            return;
        }
        const typeid:string = req.params.petTypeInfoId;
        
        try {
            const animaltype = await animalRepository.retrieveById(typeid);
        }catch(err){
            res.status(404).send({
                message: `Not found animal type with id=${typeid}.`
            });
            return;
        }

        try {
            const diseasedetail = await diseasedetailRepository.retrieveByAnimalTypeId(typeid);
            try {
                const diseasenutrition = await Promise.all(diseasedetail.map(async (diseasedetailData: Diseasedetail) => {
                    await diseasenutritionRepository.deleteByDiseaseId(diseasedetailData.disease_id);
                    await diseaseRepository.deleteByDiseaseId(diseasedetailData.disease_id);
                    return;
                }));
                await diseasedetailRepository.deleteByAnimalTypeId(typeid);
                await petRepository.deleteByAnimalTypeId(typeid);
                await animalRepository.deleteById(typeid);
            }catch(err){
                logging.error(NAMESPACE, 'Error call deleteById from delete animal type');
                throw err;
            }
            logging.info(NAMESPACE, "Delete animal type successfully.");
            res.status(200).send({
                message: "Delete animal type successfully!"
            });
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: `Could not delete animal type with id=${typeid}.`
            });
        }
    }
}
