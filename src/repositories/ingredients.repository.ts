import { Ingredients } from "../entity/ingredients.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Ingredients Repository";

interface IIngredientsRepository {
    save(ingredient:Ingredients): Promise<Ingredients>;
    update(ingredient:Ingredients): Promise<Ingredients>;
    retrieveAll(): Promise<Ingredients[]>;
    retrieveById(ingredientid: string): Promise<Ingredients | undefined>;
    deleteById(ingredientid: string): Promise<number>;
    deleteAll(): Promise<number>
}

class IngredientsRepository implements IIngredientsRepository {
    async save(ingredient:Ingredients): Promise<Ingredients> {
        try {
            const connect = AppDataSource.getRepository(Ingredients)
            const info = await connect.find(
                { where: { ingredient_name: ingredient.ingredient_name } }
            );
            if (info.length > 0 ){
                logging.error(NAMESPACE, "Duplicate ingredients name.");
                throw 'Duplicate ingredients name.';
            }
            
            const result =  await connect.save(ingredient);
            logging.info(NAMESPACE, "Save ingredients successfully.");
            try {
                const res = await this.retrieveById(result.ingredient_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveById from insert ingredients');
                throw err;
            }
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async update(ingredient: Ingredients): Promise<Ingredients> {
        try {
            const connect = AppDataSource.getRepository(Ingredients)
            const info = await connect.find(
                { where: { ingredient_name: ingredient.ingredient_name } }
            );
            
            if (info.length > 0){
                for (let i = 0; i < info.length; i++) {
                    if (info[i].ingredient_id !== ingredient.ingredient_id) {
                        logging.error(NAMESPACE, "Duplicate ingredients name.");
                        throw 'Duplicate ingredients name.';
                    }
                }
            }

            const result = await connect.update({ ingredient_id : ingredient.ingredient_id}, ingredient);
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found ingredients with id: " + ingredient.ingredient_id);
                throw new Error("Not found ingredients with id: " + ingredient.ingredient_id);
            }
            logging.info(NAMESPACE, "Update ingredients successfully.");
            try {
                const res = await this.retrieveById(ingredient.ingredient_id);
                return res;
            }catch(err){
                logging.error(NAMESPACE, 'Error call retrieveById from update ingredients');
                throw err;
            }
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveAll(): Promise<Ingredients[]>{
        try {
            const result = await AppDataSource.getRepository(Ingredients).find({
                select: ["ingredient_id","ingredient_name"]
            });
            logging.info(NAMESPACE, "Get all ingredients successfully.");
            return result;
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(ingredientid: string): Promise<Ingredients> {
        try {
            const result = await AppDataSource.getRepository(Ingredients).findOne({
                where: { ingredient_id : ingredientid },
                select: ["ingredient_id","ingredient_name"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found ingredients with id: " + ingredientid);
                throw new Error("Not found ingredients with id: " + ingredientid);
            }
            logging.info(NAMESPACE, "Get ingredients by id successfully.");
            return result;
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(ingredientid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Ingredients)
            const result = await connect.delete({ ingredient_id : ingredientid});
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found ingredients with id: " + ingredientid);
                throw new Error("Not found ingredients with id: " + ingredientid);
            }
            logging.error(NAMESPACE, "Delete ingredients by id successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number>{
        try {
            const result = await AppDataSource.getRepository(Ingredients).delete({});
            logging.info(NAMESPACE, "Delete all ingredients successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new IngredientsRepository();
