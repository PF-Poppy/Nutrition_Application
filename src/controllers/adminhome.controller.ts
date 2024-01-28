import { Request, Response } from 'express';
import ingredientsRepository from '../repositories/ingredients.repository';
import petrecipesRepository from '../repositories/petrecipes.repository';
import userRespository from '../repositories/user.respository';
import animaltypeRepository from '../repositories/animaltype.repository';
import logging from '../config/logging';

const NAMESPACE = 'AdminHome Controller';

export default class AdminHomeController {
    async getAdminHome(req: Request, res: Response) {
        logging.info(NAMESPACE, 'getAdminHome');
        try {
            const ingredients = await ingredientsRepository.retrieveAll();
            const petrecipes = await petrecipesRepository.retrieveAll();
            const users = await userRespository.retrieveAll();
            const animaltypes = await animaltypeRepository.retrieveAll();
            return res.status(200).json({
                totalIngredientAmount: ingredients.length,
                totalRecipeAmount: petrecipes.length,
                totalUserAmount: users.length,
                totalPetTypeAmount: animaltypes.length
            });
        } catch (error) {
            return res.status(500).json(error);
        }
    }

}