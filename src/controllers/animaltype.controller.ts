import { Request, Response } from "express";
import { JwtPayload } from 'jsonwebtoken';
import { AnimalType } from "../entity/animaltype.entity";
import { Diseasedetail } from "../entity/diseasedetail.entity";
import { Diseasenutrition } from "../entity/diseasenutrition.entity";
import { Nutritionsecondary } from "../entity/nutritionsecondary.entity";
import { Basenutrition } from "../entity/basenutrition.entity";
import { Baseanimaltype } from "../entity/baseanimaltype.entity";
import { Physiology } from "../entity/physiology.entity";
import { Nutrientsrequirement } from "../entity/nutrientsrequirement.entity";
import petRepository from "../repositories/pet.repository";
import nutritionsecondaryRepository from "../repositories/nutritionsecondary.repository";
import animalRepository from "../repositories/animaltype.repository";
import diseasedetailRepository from "../repositories/diseasedetail.repository";
import diseasenutritionRepository from "../repositories/diseasenutrition.repository";
import baseanimaltypeRepositoty from "../repositories/baseanimaltype.repositoty";
import basenutritionRepository from "../repositories/basenutrition.repository";
import physiologyRepository from "../repositories/physiology.repository";
import nutrientsrequirementRepository from "../repositories/nutrientsrequirement.repository";
import logging from "../config/logging";


const NAMESPACE = "AnimalType Controller";

export default class AnimalController {
    async getAllAnimalType(req: Request, res: Response) {
        logging.info(NAMESPACE, 'Get all animal type');
        try {
            const animaltype = await animalRepository.retrieveAll();

            const result = await Promise.all(animaltype?.map(async (animaltypeData: AnimalType) => {
                const baseanimaltype = await baseanimaltypeRepositoty.retrieveByAnimalTypeId(animaltypeData.type_id);
                const physiology = await physiologyRepository.retrieveByAnimalTypeId(animaltypeData.type_id);
                const diseasedetail = await diseasedetailRepository.retrieveByAnimalTypeId(animaltypeData.type_id);
                
                const nutrientsrequirement = await Promise.all(baseanimaltype?.map(async (baseanimaltypeData: Baseanimaltype) => {
                    const basenutrition = await basenutritionRepository.retrieveByBaseId(baseanimaltypeData.base_id);
                    const sortbasenutrition = basenutrition.sort((a, b) => a.order_value - b.order_value);

                    const nutrientlimitinfo = await Promise.all(sortbasenutrition?.map(async (basenutritionData: any) => {
                        return {
                            nutrientName: basenutritionData.nutrient_name,
                            unit: basenutritionData.nutrient_unit,
                            min: basenutritionData.value_min,
                            max: basenutritionData.value_max
                        };
                    }));

                    return {
                        petPhysiologicalId: baseanimaltypeData.base_id,
                        petPhysiologicalName: baseanimaltypeData.base_name,
                        description: baseanimaltypeData.description,
                        NutrientLimitInfo: nutrientlimitinfo
                    }
                }));

                const physiological = await Promise.all(physiology?.map(async (physiologyData: Physiology) => {
                    const nutrientsrequirement = await nutrientsrequirementRepository.retrieveByPhysiologyId(physiologyData.physiology_id);
                    const sortnutrientsrequirement = nutrientsrequirement.sort((a, b) => a.order_value - b.order_value);

                    const nutrientlimitinfo = await Promise.all(sortnutrientsrequirement?.map(async (nutrientsrequirementData: any) => {
                        return {
                            nutrientName: nutrientsrequirementData.nutrient_name,
                            unit: nutrientsrequirementData.nutrient_unit,
                            min: nutrientsrequirementData.value_min,
                            max: nutrientsrequirementData.value_max
                        };
                    }));

                    return {
                        petPhysiologicalId: physiologyData.physiology_id,
                        petPhysiologicalName: physiologyData.physiology_name,
                        description: physiologyData.description,
                        NutrientLimitInfo: nutrientlimitinfo
                    }
                }));

                const chronicDisease = await Promise.all(diseasedetail?.map(async (diseasedetailData: Diseasedetail) => {
                    const diseasenutrition = await diseasenutritionRepository.retrieveByDiseaseId(diseasedetailData.disease_id);
                    const sortdiseasenutrition = diseasenutrition.sort((a, b) => a.order_value - b.order_value);

                    const nutrientlimitinfo = await Promise.all(sortdiseasenutrition?.map(async (diseasenutritionData: any) => {
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
                        description: diseasedetailData.description,
                        NutrientLimitInfo: nutrientlimitinfo
                    };
                }));
                
                return {
                    petTypeId: animaltypeData.type_id,
                    petTypeName: animaltypeData.type_name,
                    nutritionalRequirementBase: nutrientsrequirement,
                    petPhysiological: physiological,
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
            
            const result = await Promise.all(animaltype?.map(async (animaltypeData: AnimalType) => {
                const diseasedetail = await diseasedetailRepository.retrieveByAnimalTypeId(animaltypeData.type_id);
                
                const chronicDisease = await Promise.all(diseasedetail?.map(async (diseasedetailData: Diseasedetail) => {
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
        const { petTypeName,nutritionalRequirementBase,petPhysiological, petChronicDisease} = req.body;
        if (!petTypeName || !petChronicDisease || !nutritionalRequirementBase || !petPhysiological) {
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
            
            animaltype.baseanimaltype = await Promise.all(nutritionalRequirementBase?.map(async (nutrientbase: any) => {
                if (!nutrientbase.petPhysiologicalName || !nutrientbase.NutrientLimitInfo) {
                    await animalRepository.deleteById(addanimaltype.type_id);
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const baseanimaltype = new Baseanimaltype();
                    baseanimaltype.base_name = nutrientbase.petPhysiologicalName;
                    baseanimaltype.animaltype_type_id = addanimaltype.type_id;
                    baseanimaltype.description = nutrientbase.description;
                    baseanimaltype.create_by = `${userid}_${username}`;
                    baseanimaltype.update_by = `${userid}_${username}`;
                    baseanimaltype.update_date = new Date();
                    const addnewbaseanimaltype = await baseanimaltypeRepositoty.save(baseanimaltype);
                
                    let order_value:number = 0;
                    baseanimaltype.basenutrition = [];
                    for (const nutrientInfoData of nutrientbase.NutrientLimitInfo) {
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

                            const nutrientInfo = new Basenutrition();
                            nutrientInfo.baseanimaltype_base_id = addnewbaseanimaltype.base_id;
                            nutrientInfo.nutritionsecondary_nutrition_id = nutrient!.nutrition_id;
                            nutrientInfo.value_min = nutrientInfoData.min;
                            nutrientInfo.value_max = nutrientInfoData.max;
                            nutrientInfo.create_by = `${userid}_${username}`;
                            nutrientInfo.update_by = `${userid}_${username}`;
                            nutrientInfo.update_date = new Date();
                            try {
                                const addnewbasenutrition = await basenutritionRepository.save(nutrientInfo);
                                baseanimaltype.basenutrition.push(addnewbasenutrition);
                            }catch(err){
                                throw err;
                            }
                        }catch (err) {
                            throw err;
                        }
                    }
                }catch(err){
                    await animalRepository.deleteById(addanimaltype.type_id);
                    throw err;
                }
                return;
            }));

            animaltype.physiology = await Promise.all(petPhysiological?.map(async (physiologicalData: any) => {
                if (!physiologicalData.petPhysiologicalName || !physiologicalData.NutrientLimitInfo) {
                    await animalRepository.deleteById(addanimaltype.type_id);
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const physiology = new Physiology();
                    physiology.physiology_name = physiologicalData.petPhysiologicalName;
                    physiology.animaltype_type_id = addanimaltype.type_id;
                    physiology.description = physiologicalData.description;
                    physiology.create_by = `${userid}_${username}`;
                    physiology.update_by = `${userid}_${username}`;
                    physiology.update_date = new Date();
                    const addnewphysiology = await physiologyRepository.save(physiology);

                    let order_value: number = 0;
                    physiology.nutrientsrequirement = [];
                    for (const nutrientInfoData of physiologicalData.NutrientLimitInfo) {
                        if (!nutrientInfoData.nutrientName || nutrientInfoData.min == undefined || nutrientInfoData.max == undefined) {
                            throw new Error("Please fill in all the fields!");
                        }

                        try {
                            const nutrient = await nutritionsecondaryRepository.retrieveByName(nutrientInfoData.nutrientName);

                            const nutrient_value = new Nutritionsecondary();
                            nutrient_value.order_value = order_value;
                            nutrient_value.nutrient_name = nutrientInfoData.nutrientName;
                            await nutritionsecondaryRepository.updatenutritionorder_value(nutrient_value);
                            order_value++;

                            const nutrientInfo = new Nutrientsrequirement();
                            nutrientInfo.physiology_physiology_id = addnewphysiology.physiology_id;
                            nutrientInfo.nutritionsecondary_nutrition_id = nutrient!.nutrition_id;
                            nutrientInfo.value_min = nutrientInfoData.min;
                            nutrientInfo.value_max = nutrientInfoData.max;
                            nutrientInfo.create_by = `${userid}_${username}`;
                            nutrientInfo.update_by = `${userid}_${username}`;
                            nutrientInfo.update_date = new Date();
                            try {
                                const addnewnutrientsrequirement = await nutrientsrequirementRepository.save(nutrientInfo);
                                physiology.nutrientsrequirement.push(addnewnutrientsrequirement);
                            }catch (err) {
                                throw err;
                            }
                        }catch(err){
                            throw err;
                        }
                    }
                }catch (err) {
                    await animalRepository.deleteById(addanimaltype.type_id);
                    throw err;
                }
                return;
            }));
            
            animaltype.diseasedetail = await Promise.all(petChronicDisease?.map(async (diseaseData: any) => {
                if (!diseaseData.petChronicDiseaseName || !diseaseData.NutrientLimitInfo) {
                    await animalRepository.deleteById(addanimaltype.type_id);
                    throw new Error("Please fill in all the fields!");
                }
                try {
                    const chronicDisease = new Diseasedetail();
                    chronicDisease.disease_name = diseaseData.petChronicDiseaseName;
                    chronicDisease.animaltype_type_id = addanimaltype.type_id;
                    chronicDisease.description = diseaseData.description;
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

        const { deletedNutritionalRequirementBase,deletedPetPhysiological,deletedPetChronicDisease, petTypeInfo} = req.body;
        console.log(req.body)

        await Promise.all(deletedNutritionalRequirementBase?.map(async (baseId: string) => {
            await baseanimaltypeRepositoty.deleteById(baseId);
        }));
        await Promise.all(deletedPetPhysiological?.map(async (physiologicalId: string) => {
            await physiologyRepository.deleteById(physiologicalId);
        }));
        await Promise.all(deletedPetChronicDisease?.map(async (diseaseId: string) => {
            await diseasedetailRepository.deleteById(diseaseId);
        }));

        if (petTypeInfo.petTypeId === "" || petTypeInfo.petTypeId === null || petTypeInfo.petTypeId === undefined) {
            res.status(400).json({
              message: "Pet type id can not be empty!"
            });
            return;
        }
        if (!petTypeInfo.petTypeName || !petTypeInfo.petChronicDisease || !petTypeInfo.nutritionalRequirementBase || !petTypeInfo.petPhysiological) {
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
            await animalRepository.update(animaltype);

            animaltype.baseanimaltype = await Promise.all((petTypeInfo.nutritionalRequirementBase)?.map(async (nutrientbase: any) => {
                if (nutrientbase.petPhysiologicalId === "") {
                    if (!nutrientbase.petPhysiologicalName || !nutrientbase.NutrientLimitInfo) {
                        throw new Error("Please fill in all the fields!");
                    }
                }else {
                    if (!nutrientbase.petPhysiologicalId || !nutrientbase.NutrientLimitInfo) {
                        throw new Error("Please fill in all the fields!");
                    }
                }
                await Promise.all((nutrientbase.NutrientLimitInfo)?.map(async (nutrientInfoData: any) => {
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

            animaltype.physiology = await Promise.all((petTypeInfo.petPhysiological)?.map(async (physiologicalData: any) => {
                if (physiologicalData.petPhysiologicalId === "") {
                    if (!physiologicalData.petPhysiologicalName || !physiologicalData.NutrientLimitInfo) {
                        throw new Error("Please fill in all the fields!");
                    }
                }else {
                    if (!physiologicalData.petPhysiologicalId || !physiologicalData.NutrientLimitInfo) {
                        throw new Error("Please fill in all the fields!");
                    }
                }
                await Promise.all((physiologicalData.NutrientLimitInfo)?.map(async (nutrientInfoData: any) => {
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

            animaltype.diseasedetail = await Promise.all((petTypeInfo.petChronicDisease)?.map(async (diseaseData: any) => {
                if (diseaseData.petChronicDiseaseId === "") {
                    if (!diseaseData.petChronicDiseaseName || !diseaseData.NutrientLimitInfo) {
                        throw new Error("Please fill in all the fields!");
                    }
                }else {
                    if (!diseaseData.petChronicDiseaseId || !diseaseData.NutrientLimitInfo) {
                        throw new Error("Please fill in all the fields!");
                    }
                }
                await Promise.all((diseaseData.NutrientLimitInfo)?.map(async (nutrientInfoData: any) => {
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

            animaltype.baseanimaltype = await Promise.all((petTypeInfo.nutritionalRequirementBase)?.map(async (nutrientbase: any) => {
                const baseanimaltype = new Baseanimaltype();
                baseanimaltype.base_name = nutrientbase.petPhysiologicalName;
                baseanimaltype.animaltype_type_id = petTypeInfo.petTypeId;
                baseanimaltype.description = nutrientbase.description;
                baseanimaltype.update_by = `${userid}_${username}`;
                baseanimaltype.update_date = new Date();
                try {
                    let updatedbaseanimaltype: Baseanimaltype;
                    if (nutrientbase.petPhysiologicalId === "") {
                        baseanimaltype.create_by = `${userid}_${username}`;
                        updatedbaseanimaltype = await baseanimaltypeRepositoty.save(baseanimaltype);
                    }else{
                        baseanimaltype.base_id = nutrientbase.petPhysiologicalId;
                        updatedbaseanimaltype = await baseanimaltypeRepositoty.update(baseanimaltype);
                    }
                    
                    let order_value: number = 0;
                    baseanimaltype.basenutrition = [];
                    for (const nutrientInfoData of nutrientbase.NutrientLimitInfo) {
                        try {
                            const nutrient = await nutritionsecondaryRepository.retrieveByName(nutrientInfoData.nutrientName);

                            const nutrientorder_value = new Nutritionsecondary();
                            nutrientorder_value.order_value = order_value;
                            nutrientorder_value.nutrient_name = nutrientInfoData.nutrientName;
                            await nutritionsecondaryRepository.updatenutritionorder_value(nutrientorder_value);
                            order_value++;

                            const nutrientInfo = new Basenutrition();
                            nutrientInfo.baseanimaltype_base_id = updatedbaseanimaltype.base_id;
                            nutrientInfo.nutritionsecondary_nutrition_id = nutrient!.nutrition_id;
                            nutrientInfo.value_min = nutrientInfoData.min;
                            nutrientInfo.value_max = nutrientInfoData.max;
                            nutrientInfo.update_by = `${userid}_${username}`;
                            nutrientInfo.update_date = new Date();

                            const updatebasenutrition = await basenutritionRepository.update(nutrientInfo);
                            baseanimaltype.basenutrition.push(updatebasenutrition);
                        } catch (err) {
                            throw err;
                        }
                    }
                }catch(err){
                    throw err;
                }
                return;
            }));

            animaltype.physiology = await Promise.all((petTypeInfo.petPhysiological)?.map(async (physiologicalData: any) => {
                const physiology = new Physiology();
                physiology.physiology_name = physiologicalData.petPhysiologicalName;
                physiology.animaltype_type_id = petTypeInfo.petTypeId;
                physiology.description = physiologicalData.description;
                physiology.update_by = `${userid}_${username}`;
                physiology.update_date = new Date();
                try {
                    let updatephysiology: Physiology;
                    if (physiologicalData.petPhysiologicalId === "") {
                        physiology.create_by = `${userid}_${username}`;
                        updatephysiology = await physiologyRepository.save(physiology);
                    }else{
                        physiology.physiology_id = physiologicalData.petPhysiologicalId;
                        updatephysiology = await physiologyRepository.update(physiology);
                    }
                    
                    let order_value: number = 0;
                    physiology.nutrientsrequirement = [];
                    for (const nutrientInfoData of physiologicalData.NutrientLimitInfo) {
                        try {
                            const nutrient = await nutritionsecondaryRepository.retrieveByName(nutrientInfoData.nutrientName);

                            const nutrientorder_value = new Nutritionsecondary();
                            nutrientorder_value.order_value = order_value;
                            nutrientorder_value.nutrient_name = nutrientInfoData.nutrientName;
                            await nutritionsecondaryRepository.updatenutritionorder_value(nutrientorder_value);
                            order_value++;

                            const nutrientInfo = new Nutrientsrequirement();
                            nutrientInfo.physiology_physiology_id = updatephysiology.physiology_id;
                            nutrientInfo.nutritionsecondary_nutrition_id = nutrient!.nutrition_id;
                            nutrientInfo.value_min = nutrientInfoData.min;
                            nutrientInfo.value_max = nutrientInfoData.max;
                            nutrientInfo.update_by = `${userid}_${username}`;
                            nutrientInfo.update_date = new Date();

                            const updatephysiologynutrient = await nutrientsrequirementRepository.update(nutrientInfo);
                            physiology.nutrientsrequirement.push(updatephysiologynutrient);
                        } catch (err) {
                            throw err;
                        }
                    }
                }catch(err){
                    throw err;
                }
                return;
            }));

            animaltype.diseasedetail = await Promise.all((petTypeInfo.petChronicDisease)?.map(async (diseaseData: any) => {
                const chronicDisease = new Diseasedetail();
                chronicDisease.disease_name = diseaseData.petChronicDiseaseName;
                chronicDisease.animaltype_type_id = petTypeInfo.petTypeId;
                chronicDisease.description = diseaseData.description;
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
            await animalRepository.deleteById(typeid);

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
