import { Basenutrition } from "../entity/basenutrition.entity";
import { Nutritionsecondary } from "../entity/nutritionsecondary.entity";
import { AppDataSource } from "../db/data-source";  
import logging from "../config/logging";

const NAMESPACE = "Basenutrition Repository";

interface IBasenutritionRepository {
    save(basenutrition: Basenutrition): Promise<Basenutrition>;
    update(basenutrition: Basenutrition): Promise<Basenutrition>;
    retrieveById(basenutritionid: string): Promise<Basenutrition | undefined>;
    retrieveByBaseId(baseid: string): Promise<any[]>;
    deleteById(basenutritionid: string): Promise<number>;
    deleteAll(): Promise<number>;
}

class BasenutritionRepository implements IBasenutritionRepository{
    async save(basenutrition: Basenutrition): Promise<Basenutrition> {
        try {
            const connect = AppDataSource.getRepository(Basenutrition);
            const duplicate = await connect.findOne({
                where: { baseanimaltype_base_id: basenutrition.baseanimaltype_base_id, nutritionsecondary_nutrition_id: basenutrition.nutritionsecondary_nutrition_id}
            });
            if (duplicate) {
                logging.error(NAMESPACE, "Duplicate basenutrition.");
                throw 'Duplicate basenutrition.';
            }
            const result = await connect.save(basenutrition);
            logging.info(NAMESPACE, "Save basenutrition successfully.");
            try {
                const res = await this.retrieveById(result.basenutrition_id);
                return res;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveId from insert basenutrition');
                throw err;
            }
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(basenutrition: Basenutrition): Promise<Basenutrition> {
        let result: Basenutrition | undefined;
        try {
            const connect = AppDataSource.getRepository(Basenutrition);
            const existingTypenutrition = await connect.findOne({
                where: { baseanimaltype_base_id: basenutrition.baseanimaltype_base_id, nutritionsecondary_nutrition_id: basenutrition.nutritionsecondary_nutrition_id}
            });
            
            if (!existingTypenutrition) {
                try {
                    basenutrition.create_by = `${basenutrition.update_by}`;
                    const res = await connect.save(basenutrition);
                    logging.info(NAMESPACE, "Update basenutrition successfully.");

                    result = await this.retrieveById(res.basenutrition_id);
                    return result;
                }catch(err){
                    logging.error(NAMESPACE, 'Error saving new basenutrition');
                    throw err;
                }
            }else {
                await connect.update({ basenutrition_id: existingTypenutrition.basenutrition_id }, basenutrition);
                logging.info(NAMESPACE, "Update basenutrition successfully.");

                result = await this.retrieveById(existingTypenutrition.basenutrition_id);
                return result;
            }
        }catch(err){
            logging.error(NAMESPACE, 'Error call retrieveById from insert diseasenutrition');
            throw err;
        }
    }

    async retrieveById(basenutritionid: string): Promise<Basenutrition> {
        try {
            const connect = AppDataSource.getRepository(Basenutrition);
            const result = await connect.findOne({
                where: { basenutrition_id: basenutritionid},
                select: ["basenutrition_id", "baseanimaltype_base_id", "nutritionsecondary_nutrition_id", "value_max", "value_min"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found basenutrition with id: "+ basenutritionid);
                throw new Error('Not found basenutrition with id: '+ basenutritionid);
            }
            logging.info(NAMESPACE, "Retrieve basenutrition successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveByBaseId(baseid: string): Promise<any[]> {
        try {
            const result = await AppDataSource.getRepository(Basenutrition)
            .createQueryBuilder("basenutrition")
            .innerJoinAndSelect(Nutritionsecondary, "nutritionsecondary", "nutritionsecondary.nutrition_id = basenutrition.nutritionsecondary_nutrition_id")
            .select([
                "basenutrition.basenutrition_id AS basenutrition_id",
                "basenutrition.baseanimaltype_base_id AS baseanimaltype_base_id",
                "nutritionsecondary.nutrition_id AS nutrition_id",
                "nutritionsecondary.nutrient_name AS nutrient_name",
                "nutritionsecondary.order_value AS order_value",
                "nutritionsecondary.nutrient_unit AS nutrient_unit",
                "basenutrition.value_max AS value_max",
                "basenutrition.value_min AS value_min"
            ])
            .where("basenutrition.baseanimaltype_base_id = :baseid", { baseid: baseid })
            .getRawMany();
            logging.info(NAMESPACE, "Retrieve basenutrition by base id successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(basenutritionid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Basenutrition);
            const result = await connect.delete({ basenutrition_id: basenutritionid });
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found basenutrition with id: "+ basenutritionid);
                return 0;
            }
            logging.info(NAMESPACE, "Delete basenutrition successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Basenutrition);
            const result = await connect.delete({});
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new BasenutritionRepository();