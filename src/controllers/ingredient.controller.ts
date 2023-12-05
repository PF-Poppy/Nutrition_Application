//TODO get post update delete
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Ingredients } from '../entity/ingredients.entity';
import { Ingredientnutrition } from '../entity/ingredientnutrition.entity';
import { Nutrition } from '../entity/nutrition.entity';
import ingredientnutritionRepository from '../repositories/ingredientnutrition.repository';
import ingredientsRepository from '../repositories/ingredients.repository';
import nutritionRepository from '../repositories/nutrition.repository';
import logging from '../config/logging';

const NAMESPACE = 'Ingredientnutrition Controller';