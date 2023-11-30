import { Pet } from "../entity/pet.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";
import e from "express";

const NAMESPACE = "Pet Repository";

interface IPetRepository {
    //save(userid: string,typeid: number): Promise<Pet>;
    //retrieveAll(): Promise<Pet[]>;
    //retrieveById(petid: number): Promise<Pet | null>;
    //retrieveByName(petname: number): Promise<Pet | null>;
    //deleteByID(petid: number): Promise<number>;
    //deleteByName(petname: string): Promise<number>;
    //deleteAll(): Promise<number>;
}

class PetRepository implements IPetRepository {
    //async save(petname: string,pettype:string,username:string): Promise<Pet> {
    //}

}

export default new PetRepository();