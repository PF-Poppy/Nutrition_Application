//TODO ทำเพิ่ม
import { Request, Response } from "express";
import { JwtPayload } from 'jsonwebtoken';
import { AnimalType } from "../entity/animaltype.entity";
import { Healthdetail } from "../entity/healthdetail.entity";
import { Healthnutrition } from "../entity/healthnutrition.entity";
import nutritionRepository from "../repositories/nutrition.repository";
import animalRepository from "../repositories/animal.respository";
import healthdetailRepository from "../repositories/healthdetail.repository";
import healthnutritionRepository from "../repositories/healthnutrition.repository";
import logging from "../config/logging";

const NAMESPACE = "Animal Controller";

export default class AnimalController {
    //TODO ทำเพิ่ม
    async getAllAnimalType(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Get all animal type');
        try {
            const result = await animalRepository.retrieveAll();
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
            try {
                animaltype.healthdetail = await Promise.all(petChronicDisease.map(async (diseaseData: any) => {
                    const chronicDisease = new Healthdetail();
                    chronicDisease.health_name = diseaseData.petChronicDiseaseName;
                    chronicDisease.animaltype_type_id = addanimaltype.type_id;
                    chronicDisease.create_by = `${userid}_${username}`;
                    chronicDisease.update_by = `${userid}_${username}`;
                    chronicDisease.update_date = new Date();
                    const addnewhealthdetail = await healthdetailRepository.save(chronicDisease);
                    try {
                        chronicDisease.healthnutrition = await Promise.all(diseaseData.NutrientLimitInfo.map(async (nutrientInfoData: any) => {
                            const nutrient = await nutritionRepository.retrieveByName(nutrientInfoData.nutrientName);
                            if  (nutrient === null || nutrient === undefined) {
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
                            const addnewhealthnutrition = await healthnutritionRepository.save(nutrientInfo);
                            return;
                        }));
                    }catch (err){
                        logging.error(NAMESPACE, 'Error call retrieveByID from insert healthdetail');
                        throw err;
                    }
                return;
                }));
                logging.info(NAMESPACE, "Create animal type successfully.");
                res.status(200).send({
                    message: "Add Animal successfully!"
                });
            }catch (err){
                logging.error(NAMESPACE, 'Error call retrieveByID from insert animal type');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).send({
                message: "Some error occurred while creating animal."
            });
        }
    }

}
