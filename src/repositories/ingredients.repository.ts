import { Ingredients } from "../entity/ingredients.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "Ingredients Repository";

interface IIngredientsRepository {
    //save(ingredient:Ingredients): Promise<Ingredients>;
    //update(ingredient:Ingredients): Promise<Ingredients>;
}

class IngredientsRepository implements IIngredientsRepository {
    /*
    async save(ingredient:Ingredients): Promise<Ingredients> {
        try {
            const info = a
        }catch(err){
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
    */
}

export default IngredientsRepository;
