import { Request, Response } from "express";
import { JwtPayload } from 'jsonwebtoken';
import { AnimalType } from "../entity/animaltype.entity";
import { Healthdetail } from "../entity/healthdetail.entity";
import { Healthnutrition } from "../entity/healthnutrition.entity";
import nutritionRepository from "../repositories/nutrition.repository";
import animalRepository from "../repositories/animaltype.respository";
import healthdetailRepository from "../repositories/healthdetail.repository";
import healthnutritionRepository from "../repositories/healthnutrition.repository";
import logging from "../config/logging";

const NAMESPACE = "AnimalType Controller";

export default class AnimalController {
    async getAllAnimalType(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Get all animal type');
        try {
            const animaltype = await animalRepository.retrieveAll();

            const result = await Promise.all(animaltype.map(async (animaltypeData: any) => {
                const healthdetail = await healthdetailRepository.retrieveByAnimalTypeID(animaltypeData.type_id);

                const chronicDisease = await Promise.all(healthdetail.map(async (healthdetailData: any) => {
                    const healthnutrition = await healthnutritionRepository.retrieveByHealthID(healthdetailData.health_id);
                    
                    const nutrientlimitinfo = await Promise.all(healthnutrition.map(async (healthnutritionData: any) => {
                        const nutrition = await nutritionRepository.retrieveByID(healthnutritionData.nutrition_nutrition_id);
                        return {
                            nutrientName: nutrition!.nutrient_name,
                            min: healthnutritionData.value_min,
                            max: healthnutritionData.value_max
                        };
                    }));
                    
                    return {
                        petChronicDiseaseID: healthdetailData.health_id,
                        petChronicDiseaseName: healthdetailData.health_name,
                        NutrientLimitInfo: nutrientlimitinfo
                    };
                }));
                
                return {
                    petTypeID: animaltypeData.type_id,
                    petTypeName: animaltypeData.type_name,
                    petChronicDisease: chronicDisease
                };
            }));
            res.status(200).send(result);
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: "Some error occurred while retrieving animal."
            });
        }
    }

    async addNewAnimalType(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Add new animal type');
        const { userid, username } = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).send({
              message: "Content can not be empty!"
            });
            return;
        }
        const { petTypeName, petChronicDisease} = req.body;
        try {
            const animaltype = new AnimalType();
            animaltype.type_name = petTypeName;
            animaltype.create_by = `${userid}_${username}`;
            animaltype.update_date = new Date();
            animaltype.update_by = `${userid}_${username}`;
            const addanimaltype = await animalRepository.save(animaltype);

            animaltype.healthdetail = await Promise.all(petChronicDisease.map(async (diseaseData: any) => {
                const chronicDisease = new Healthdetail();
                chronicDisease.health_name = diseaseData.petChronicDiseaseName;
                chronicDisease.animaltype_type_id = addanimaltype.type_id;
                chronicDisease.create_by = `${userid}_${username}`;
                chronicDisease.update_by = `${userid}_${username}`;
                chronicDisease.update_date = new Date();
                try {
                    const addnewhealthdetail = await healthdetailRepository.save(chronicDisease);
                    chronicDisease.healthnutrition = await Promise.all(diseaseData.NutrientLimitInfo.map(async (nutrientInfoData: any) => {
                        const nutrient = await nutritionRepository.retrieveByName(nutrientInfoData.nutrientName);
                        if  (nutrient === null || nutrient === undefined) {
                            await healthdetailRepository.deleteByID(addnewhealthdetail.health_id);
                            throw new Error("Not found nutrient with name: " + nutrientInfoData.nutrientName);
                        }
                        const nutrientInfo = new Healthnutrition();
                        nutrientInfo.healthdetail_health_id = addnewhealthdetail.health_id;
                        nutrientInfo.nutrition_nutrition_id = nutrient!.nutrition_id;
                        nutrientInfo.value_min = nutrientInfoData.min;
                        nutrientInfo.value_max = nutrientInfoData.max;
                        nutrientInfo.create_by = `${userid}_${username}`;
                        nutrientInfo.update_by = `${userid}_${username}`;
                        nutrientInfo.update_date = new Date();
                        try {
                            const addnewhealthnutrition = await healthnutritionRepository.save(nutrientInfo);
                            return;
                        }catch(err){
                            await healthdetailRepository.deleteByID(addnewhealthdetail.health_id);
                            throw err;
                        }
                    }));
                }catch(err){
                    await animalRepository.deleteByID(addanimaltype.type_id);
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
            res.status(500).send({
                message: "Some error occurred while creating animal."
            });
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
        const { petTypeID, petTypeName, petChronicDisease} = req.body;
        if (petTypeID === "" || petTypeID === null || petTypeID === undefined) {
            res.status(400).send({
              message: "Pet type id can not be empty!"
            });
            return;
        }
        try {
            const animaltype = new AnimalType();
            animaltype.type_id = parseInt(petTypeID);
            animaltype.type_name = petTypeName;
            animaltype.update_date = new Date();
            animaltype.update_by = `${userid}_${username}`;
            const updateanimaltype = await animalRepository.update(animaltype);

            animaltype.healthdetail = await Promise.all(petChronicDisease.map(async (diseaseData: any) => {
                const chronicDisease = new Healthdetail();
                chronicDisease.health_name = diseaseData.petChronicDiseaseName;
                chronicDisease.animaltype_type_id = parseInt(petTypeID);
                chronicDisease.update_by = `${userid}_${username}`;
                chronicDisease.update_date = new Date();
                try {
                    const updatehealthdetail = await healthdetailRepository.update(chronicDisease);
                    chronicDisease.healthnutrition = await Promise.all(diseaseData.NutrientLimitInfo.map(async (nutrientInfoData: any) => {
                        const nutrient = await nutritionRepository.retrieveByName(nutrientInfoData.nutrientName);
                        if  (nutrient === null || nutrient === undefined) {
                            throw new Error("Not found nutrient with name: " + nutrientInfoData.nutrientName);
                        }
                        const nutrientInfo = new Healthnutrition();
                        nutrientInfo.healthdetail_health_id = updatehealthdetail.health_id;
                        nutrientInfo.nutrition_nutrition_id = nutrient!.nutrition_id;
                        nutrientInfo.value_min = nutrientInfoData.min;
                        nutrientInfo.value_max = nutrientInfoData.max;
                        nutrientInfo.update_by = `${userid}_${username}`;
                        nutrientInfo.update_date = new Date();
                        try {
                            const updatehealthnutrition = await healthnutritionRepository.update(nutrientInfo);
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
            res.status(500).send({
                message: "Some error occurred while update animal."
            });
        }
    }

    async deleteAnimalType(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Delete animal type');
        const typeid:number = parseInt(req.params.petTypeInfoID);
        try {
            const animaltype = await animalRepository.retrieveByID(typeid);
            const healthdetail = await healthdetailRepository.retrieveByAnimalTypeID(typeid);
            if (!animaltype) {
                res.status(404).send({
                    message: `Not found animal type with id=${typeid}.`
                });
                return;
            }
            try {
                await animalRepository.deleteByID(typeid);
                await healthdetailRepository.deleteByAnimalTypeID(typeid);
                const healthnutrition = await Promise.all(healthdetail.map(async (healthdetailData: any) => {
                    await healthnutritionRepository.deleteByHealthID(healthdetailData.health_id);
                    return;
                }));
            }catch(err){
                logging.error(NAMESPACE, 'Error call deleteByID from delete animal type');
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
