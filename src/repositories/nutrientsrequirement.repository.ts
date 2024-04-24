import { Nutrientsrequirement } from "../entity/nutrientsrequirement.entity";
import { Nutritionsecondary } from "../entity/nutritionsecondary.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";


const NAMESPACE = "Nutrientsrequirement Repository";

interface INutrientsrequirementRepository {
    save(nutrientsrequirement: Nutrientsrequirement): Promise<Nutrientsrequirement>;
    update(nutrientsrequirement: Nutrientsrequirement): Promise<Nutrientsrequirement>;
    retrieveById(nutrientsrequirementid: string): Promise<Nutrientsrequirement | undefined>;
    retrieveByPhysiologyId(physiologyid: string): Promise<any[]>;
    deleteById(nutrientsrequirementid: string): Promise<number>;
    deleteAll(): Promise<number>;
}

class NutrientsrequirementRepository implements INutrientsrequirementRepository {
    async save(nutrientsrequirement: Nutrientsrequirement): Promise<Nutrientsrequirement> {
        try {
            const connect = AppDataSource.getRepository(Nutrientsrequirement);
            const duplicate = await connect.findOne({
                where: { physiology_physiology_id: nutrientsrequirement.physiology_physiology_id, nutritionsecondary_nutrition_id: nutrientsrequirement.nutritionsecondary_nutrition_id}
            });
            if (duplicate) {
                logging.error(NAMESPACE, "Duplicate nutrientsrequirement.");
                throw 'Duplicate nutrientsrequirement.';
            }
            const result = await connect.save(nutrientsrequirement);
            logging.info(NAMESPACE, "Save nutrientsrequirement successfully.");
            try {
                const res = await this.retrieveById(result.nutrientsrequirement_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveById from insert nutrientsrequirement');
                throw err;
            }
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(nutrientsrequirement: Nutrientsrequirement): Promise<Nutrientsrequirement> {
        let result: Nutrientsrequirement | undefined;
        try {
            const connect = AppDataSource.getRepository(Nutrientsrequirement);
            const existingNutrientsrequirement = await connect.findOne({
                where: { physiology_physiology_id: nutrientsrequirement.physiology_physiology_id, nutritionsecondary_nutrition_id: nutrientsrequirement.nutritionsecondary_nutrition_id}
            });

            if (!existingNutrientsrequirement) {
                try {
                    nutrientsrequirement.create_by = `${nutrientsrequirement.update_by}`;
                    const res = await connect.save(nutrientsrequirement);
                    logging.info(NAMESPACE, "Update nutrientsrequirement successfully.");
                    
                    result = await this.retrieveById(res.nutrientsrequirement_id);
                    return result;
                }catch (err) {
                    logging.error(NAMESPACE, (err as Error).message, err);
                    throw err;
                }
            }else {
                await connect.update({ nutrientsrequirement_id: existingNutrientsrequirement.nutrientsrequirement_id }, nutrientsrequirement);
                logging.info(NAMESPACE, "Update nutrientsrequirement successfully.");

                result = await this.retrieveById(existingNutrientsrequirement.nutrientsrequirement_id);
                return result;
            }
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(nutrientsrequirementid: string): Promise<Nutrientsrequirement> {
        try {
            const connect = AppDataSource.getRepository(Nutrientsrequirement);
            const result = await connect.findOne({
                where: { nutrientsrequirement_id: nutrientsrequirementid},
                select: ["nutrientsrequirement_id", "physiology_physiology_id", "nutritionsecondary_nutrition_id", "value_max", "value_min"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found nutrientsrequirement with id: "+ nutrientsrequirementid);
                throw new Error('Not found nutrientsrequirement with id: '+ nutrientsrequirementid);
            }
            logging.info(NAMESPACE, "Retrieve nutrientsrequirement successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByPhysiologyId(physiologyid: string): Promise<any[]> {
        try {
            const result = AppDataSource.getRepository(Nutrientsrequirement)
            .createQueryBuilder("nutrientsrequirement")
            .innerJoinAndSelect(Nutritionsecondary, "nutritionsecondary", "nutritionsecondary.nutrition_id = nutrientsrequirement.nutritionsecondary_nutrition_id")
            .select([
                "nutrientsrequirement.nutrientsrequirement_id AS nutrientsrequirement_id",
                "nutrientsrequirement.physiology_physiology_id AS physiology_physiology_id",
                "nutritionsecondary.nutrition_id AS nutrition_id",
                "nutritionsecondary.nutrient_name AS nutrient_name",
                "nutritionsecondary.order_value AS order_value",
                "nutritionsecondary.nutrient_unit AS nutrient_unit",
                "nutrientsrequirement.value_max AS value_max",
                "nutrientsrequirement.value_min AS value_min"
            ])
            .where("nutrientsrequirement.physiology_physiology_id = :physiologyid", { physiologyid: physiologyid })
            .getRawMany();
            logging.info(NAMESPACE, "Retrieve nutrientsrequirement by physiology id successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        } 
    }

    async deleteById(nutrientsrequirementid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Nutrientsrequirement);
            const result = await connect.delete({ nutrientsrequirement_id: nutrientsrequirementid});
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found nutrientsrequirement with id: "+ nutrientsrequirementid);
                return 0;
            }
            logging.info(NAMESPACE, "Delete nutrientsrequirement successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Nutrientsrequirement);
            const result = await connect.delete({});
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new NutrientsrequirementRepository();