import { Request, Response } from "express";
import { JwtPayload } from 'jsonwebtoken';
import { AnimalType } from "../entity/animaltype.entity";
import { Diseasedetail } from "../entity/diseasedetail.entity";
import { Diseasenutrition } from "../entity/diseasenutrition.entity";
import { Nutritionsecondary } from "../entity/nutritionsecondary.entity";
import { Defaultnutrition } from "../entity/defaultnutrition.entity";
import petRepository from "../repositories/pet.repository";
import nutritionsecondaryRepository from "../repositories/nutritionsecondary.repository";
import animalRepository from "../repositories/animaltype.repository";
import diseasedetailRepository from "../repositories/diseasedetail.repository";
import diseasenutritionRepository from "../repositories/diseasenutrition.repository";
import defaultnutritionRepository from "../repositories/defaultnutrition.repository";
import logging from "../config/logging";


const NAMESPACE = "AnimalType Controller";

export default class AnimalController {
    async getAllAnimalType(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Get all animal type');
        try {
            const animaltype = await animalRepository.retrieveAll();

            const result = await Promise.all(animaltype.map(async (animaltypeData: AnimalType) => {
                const diseasedetail = await diseasedetailRepository.retrieveByAnimalTypeId(animaltypeData.type_id);
                const defaultnutrition = await defaultnutritionRepository.retrieveByAnimalId(animaltypeData.type_id);
                const sortdefaultnutrition = defaultnutrition.sort((a, b) => a.order_value - b.order_value);
                const defaultnutritionlimitinfo = await Promise.all(sortdefaultnutrition.map(async (diseasenutritionData: any) => {
                    return {
                        nutrientName: diseasenutritionData.nutrient_name,
                        unit: diseasenutritionData.nutrient_unit,
                        min: diseasenutritionData.value_min,
                        max: diseasenutritionData.value_max
                    };
                }));

                const chronicDisease = await Promise.all(diseasedetail.map(async (diseasedetailData: Diseasedetail) => {
                    const diseasenutrition = await diseasenutritionRepository.retrieveByDiseaseId(diseasedetailData.disease_id);
                    const sortdiseasenutrition = diseasenutrition.sort((a, b) => a.order_value - b.order_value);

                    const nutrientlimitinfo = await Promise.all(sortdiseasenutrition.map(async (diseasenutritionData: any) => {
                        return {
                            nutrientName: diseasenutritionData.nutrient_name,
                            unit: diseasenutritionData.nutrient_unit,
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
                    defaultNutrientLimitList: defaultnutritionlimitinfo,
                    petChronicDisease: chronicDisease
                };
            }));
            logging.info(NAMESPACE, "Get all animal type successfully.");
            res.status(200).json(result);
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
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
            res.status(200).json(result);
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
                message: "Some error occurred while retrieving animal."
            });
        }
    }

    async addNewAnimalType(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Add new animal type');
        if (!req.body) {
            res.status(400).json({
                message: 'Content can not be empty!'
            });
            return;
        }
        const { userid, username } = (req as JwtPayload).jwtPayload;
        const { petTypeName,defaultNutrientLimitList, petChronicDisease} = req.body;
        if (!petTypeName || !petChronicDisease || !defaultNutrientLimitList) {
            res.status(400).json({
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

            let order_value: number = 0;
            animaltype.defaultnutrition = [];
            try {
                for (const nutrientInfoData of defaultNutrientLimitList) {
                    if (!nutrientInfoData.nutrientName || nutrientInfoData.min == undefined || nutrientInfoData.max == undefined) {
                        throw new Error("Please fill in all the fields!");
                    }
                    try {
                        const nutrient = await nutritionsecondaryRepository.retrieveByName(nutrientInfoData.nutrientName);

                        const nutrientorder_value = new Nutritionsecondary();
                        nutrientorder_value.order_value = order_value;
                        nutrientorder_value.nutrient_name = nutrientInfoData.nutrientName;
                        await nutritionsecondaryRepository.updatenutritionorder_value(nutrientorder_value);
                        order_value++;

                        const nutrientInfo = new Defaultnutrition();
                        nutrientInfo.animaltype_type_id = addanimaltype.type_id;
                        nutrientInfo.nutritionsecondary_nutrition_id = nutrient!.nutrition_id;
                        nutrientInfo.value_min = nutrientInfoData.min;
                        nutrientInfo.value_max = nutrientInfoData.max;
                        nutrientInfo.create_by = `${userid}_${username}`;
                        nutrientInfo.update_by = `${userid}_${username}`;
                        nutrientInfo.update_date = new Date();
                        try {
                            const addnewdefaultnutrition = await defaultnutritionRepository.save(nutrientInfo);
                            animaltype.defaultnutrition.push(addnewdefaultnutrition);
                        }catch(err){
                            throw err;
                        }
                    }catch(err){
                        throw err;
                    }
                }
            }catch(err){
                await animalRepository.deleteById(addanimaltype.type_id);
                throw err;
            }
            animaltype.diseasedetail = await Promise.all(petChronicDisease.map(async (diseaseData: any) => {
                if (!diseaseData.petChronicDiseaseName || !diseaseData.NutrientLimitInfo) {
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
                    
                    let order_value: number = 0;
                    chronicDisease.diseasenutrition = [];
                    for (const nutrientInfoData of diseaseData.NutrientLimitInfo) {
                        if (!nutrientInfoData.nutrientName || nutrientInfoData.min == undefined || !nutrientInfoData.max == undefined) {
                            throw new Error("Please fill in all the fields!");
                        }
                        
                        try {
                            const nutrient = await nutritionsecondaryRepository.retrieveByName(nutrientInfoData.nutrientName);

                            const nutrientorder_value = new Nutritionsecondary();
                            nutrientorder_value.order_value = order_value;
                            nutrientorder_value.nutrient_name = nutrientInfoData.nutrientName;
                            await nutritionsecondaryRepository.updatenutritionorder_value(nutrientorder_value);
                            order_value++;

                            const nutrientInfo = new Diseasenutrition();
                            nutrientInfo.diseasedetail_disease_id = addnewdiseasedetail.disease_id;
                            nutrientInfo.nutritionsecondary_nutrition_id = nutrient!.nutrition_id;
                            nutrientInfo.value_min = nutrientInfoData.min;
                            nutrientInfo.value_max = nutrientInfoData.max;
                            nutrientInfo.create_by = `${userid}_${username}`;
                            nutrientInfo.update_by = `${userid}_${username}`;
                            nutrientInfo.update_date = new Date();
                            try {
                                const addnewdiseasenutrition = await diseasenutritionRepository.save(nutrientInfo);
                                chronicDisease.diseasenutrition.push(addnewdiseasenutrition);
                            }catch(err){
                                throw err;
                            }
                        }catch(err){
                            throw err;
                        }
                    }
                }catch(err){
                    await animalRepository.deleteById(addanimaltype.type_id);
                    throw err;
                }
                return;
            }));
            logging.info(NAMESPACE, "Create animal type successfully.");
            res.status(200).json({
                message: "Add Animal successfully!"
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

    async updateAnimalType(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Update animal type');
        const { userid, username } = (req as JwtPayload).jwtPayload;
        if (!req.body) {
            res.status(400).json({
              message: "Content can not be empty!"
            });
            return;
        }

        const { deletedPetChronicDiseaseList, petTypeInfo} = req.body;
        await Promise.all(deletedPetChronicDiseaseList.map(async (nutrientInfoData: any) => {
            await diseasedetailRepository.deleteById(nutrientInfoData);
        }));
        
        if (petTypeInfo.petTypeId === "" || petTypeInfo.petTypeId === null || petTypeInfo.petTypeId === undefined) {
            res.status(400).json({
              message: "Pet type id can not be empty!"
            });
            return;
        }
        if (!petTypeInfo.petTypeName || !petTypeInfo.petChronicDisease || !petTypeInfo.defaultNutrientLimitList) {
            res.status(400).json({
                message: "Please fill in all the fields!"
            });
            return;
        }
        
    
        try {
            const animaltype = await animalRepository.retrieveById(petTypeInfo.petTypeId);
        }catch(err){
            res.status(404).json({
                message: `Not found animal type with id=${petTypeInfo.petTypeId}.`
            });
            return;
        }
        
        try {

            const animaltype = new AnimalType();
            animaltype.type_id = petTypeInfo.petTypeId;
            animaltype.type_name = petTypeInfo.petTypeName;
            animaltype.update_date = new Date();
            animaltype.update_by = `${userid}_${username}`;
            const updateanimaltype = await animalRepository.update(animaltype);

            animaltype.defaultnutrition = await Promise.all(petTypeInfo.defaultNutrientLimitList.map(async (nutrientInfoData: any) => {
                if (!nutrientInfoData.nutrientName || nutrientInfoData.min == undefined || nutrientInfoData.max == undefined) {
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const nutrient = await nutritionsecondaryRepository.retrieveByName(nutrientInfoData.nutrientName);
                }catch(err){
                    throw err;
                }
            }));

            animaltype.diseasedetail = await Promise.all(petTypeInfo.petChronicDisease.map(async (diseaseData: any) => {
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
                    if (!nutrientInfoData.nutrientName || nutrientInfoData.min == undefined || nutrientInfoData.max == undefined) {
                        throw new Error("Please fill in all the fields!");
                    }
                    try {
                        const nutrient = await nutritionsecondaryRepository.retrieveByName(nutrientInfoData.nutrientName);
                    }catch(err){
                        throw err;
                    }
                }));
            }));

            let order_value: number = 0;
            animaltype.defaultnutrition = [];
            for (const nutrientInfoData of petTypeInfo.defaultNutrientLimitList) {
                try {
                    const nutrient = await nutritionsecondaryRepository.retrieveByName(nutrientInfoData.nutrientName);

                    const nutrientorder_value = new Nutritionsecondary();
                    nutrientorder_value.order_value = order_value;
                    nutrientorder_value.nutrient_name = nutrientInfoData.nutrientName;
                    await nutritionsecondaryRepository.updatenutritionorder_value(nutrientorder_value);
                    order_value++;

                    const nutrientInfo = new Defaultnutrition();
                    nutrientInfo.animaltype_type_id = petTypeInfo.petTypeId;
                    nutrientInfo.nutritionsecondary_nutrition_id = nutrient!.nutrition_id;
                    nutrientInfo.value_min = nutrientInfoData.min;
                    nutrientInfo.value_max = nutrientInfoData.max;
                    nutrientInfo.update_by = `${userid}_${username}`;
                    nutrientInfo.update_date = new Date();
                    try {
                        const updatedefaultnutrition = await defaultnutritionRepository.update(nutrientInfo);
                        animaltype.defaultnutrition.push(updatedefaultnutrition);
                    }catch(err){
                        throw err;
                    }
                }catch(err){
                    throw err;
                }
            }

            animaltype.diseasedetail = await Promise.all(petTypeInfo.petChronicDisease.map(async (diseaseData: any) => {
                const chronicDisease = new Diseasedetail();
                chronicDisease.disease_name = diseaseData.petChronicDiseaseName;
                chronicDisease.animaltype_type_id = petTypeInfo.petTypeId;
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
                    
                    let order_value: number = 0;
                    chronicDisease.diseasenutrition = [];
                    for (const nutrientInfoData of diseaseData.NutrientLimitInfo) {
                        try {
                            const nutrient = await nutritionsecondaryRepository.retrieveByName(nutrientInfoData.nutrientName);

                            const nutrientorder_value = new Nutritionsecondary();
                            nutrientorder_value.order_value = order_value;
                            nutrientorder_value.nutrient_name = nutrientInfoData.nutrientName;
                            await nutritionsecondaryRepository.updatenutritionorder_value(nutrientorder_value);
                            order_value++;

                            const nutrientInfo = new Diseasenutrition();
                            nutrientInfo.diseasedetail_disease_id = updatediseasedetail.disease_id;
                            nutrientInfo.nutritionsecondary_nutrition_id = nutrient!.nutrition_id;
                            nutrientInfo.value_min = nutrientInfoData.min;
                            nutrientInfo.value_max = nutrientInfoData.max;
                            nutrientInfo.update_by = `${userid}_${username}`;
                            nutrientInfo.update_date = new Date();

                            const updatediseasenutrition = await diseasenutritionRepository.update(nutrientInfo);
                            chronicDisease.diseasenutrition.push(updatediseasenutrition);
                        } catch (err) {
                            throw err;
                        }
                    }
                }catch(err){
                    throw err;
                }
                return;
            }));
            logging.info(NAMESPACE, "Update animal type successfully.");
            res.status(200).json({
                message: "Update Animal successfully!"
            });
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            if ( (err as Error).message === "Please fill in all the fields!" ) {
                res.status(400).json({
                    message: (err as Error).message
                });
                return;
            }else {
                res.status(500).json({
                    message: "Some error occurred while update animal."
                });
                return;
            }
        }
    }

    async deleteAnimalType(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Delete animal type');
        if (req.params.petTypeInfoId === ":petTypeInfoId" || !req.params.petTypeInfoId) {
            res.status(400).json({
                message: "Pet type id can not be empty!"
            });
            return;
        }
        const typeid:string = req.params.petTypeInfoId;
        
        try {
            const animaltype = await animalRepository.retrieveById(typeid);
        }catch(err){
            res.status(404).json({
                message: `Not found animal type with id=${typeid}.`
            });
            return;
        }

        try {
            const diseasedetail = await diseasedetailRepository.retrieveByAnimalTypeId(typeid);
            const pet = await petRepository.retrieveByAnimalTypeId(typeid);
            try {
                await animalRepository.deleteById(typeid);
            }catch(err){
                logging.error(NAMESPACE, 'Error call deleteById from delete animal type');
                throw err;
            }
            logging.info(NAMESPACE, "Delete animal type successfully.");
            res.status(200).json({
                message: "Delete animal type successfully!"
            });
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            res.status(500).json({
                message: `Could not delete animal type with id=${typeid}.`
            });
        }
    }
}
