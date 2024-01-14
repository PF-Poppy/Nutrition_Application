import { Petrecipes } from "../entity/petrecipes.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "PetRecipes Repositor";

interface IPetRecipesRepository {
    save(petrecipes:Petrecipes): Promise<Petrecipes>;
    retrieveById(recipesid: string): Promise<Petrecipes | undefined>;
    deleteById(recipesid: string): Promise<number>;
    deleteAll(): Promise<number>;
}

class PetRecipesRepository implements IPetRecipesRepository {
    async save(petrecipes:Petrecipes): Promise<Petrecipes> {
        try {
            const connect = AppDataSource.getRepository(Petrecipes)
            const duplicatedata = await connect.findOne(
                { where: { recipes_name: petrecipes.recipes_name, animaltype_type_id: petrecipes.animaltype_type_id } }
            );
            if (duplicatedata) {
                logging.error(NAMESPACE, "Duplicate pet recipes.");
                throw 'Duplicate pet recipes.';
            }

            const result = await connect.save(petrecipes);
            logging.info(NAMESPACE, "Save pet recipes successfully.");
            try {
                const res = await this.retrieveById(result.recipes_id);
                return res;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveById from insert pet recipes');
                throw err;
            }
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveById(recipesid: string): Promise<Petrecipes> {
        try {
            const result = await AppDataSource.getRepository(Petrecipes).findOne({
                where: { recipes_id: recipesid },
                select: ["recipes_id", "recipes_name", "animaltype_type_id", "description"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found pet recipes with id: " + recipesid);
                throw new Error("Not found pet recipes with id: " + recipesid);
            }
            logging.info(NAMESPACE, "Retrieve pet recipes successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteById(recipesid: string): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Petrecipes);
            const result = await connect.delete({ recipes_id: recipesid });
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found pet recipes with id: " + recipesid);
                throw new Error("Not found pet recipes with id: " + recipesid);
            }
            logging.info(NAMESPACE, "Delete pet recipes by id successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteAll(): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(Petrecipes);
            const result = await connect.delete({});
            logging.info(NAMESPACE, "Delete all pet recipes successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

}

export default new PetRecipesRepository();