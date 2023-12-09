import { Role } from "../entity/role.entity";
import { AppDataSource } from "../db/data-source";
import logging from '../config/logging';

const NAMESPACE = 'Role Repository';

interface IROleRepository {
    save(role:Role): Promise<Role>;
    update(role:Role): Promise<Role>;
    retrieveAll(): Promise<Role[]>;
    retrieveByName(rolename:string): Promise<Role | undefined>;
    retrieveByID(roleid: number): Promise<Role | undefined>;
    deleteByID(roleid: number): Promise<number>;
    deleteAll(): Promise<number>;
}

class ROleRepository implements IROleRepository {
    async save(role:Role): Promise<Role> {
        try {
            const connect = AppDataSource.getRepository(Role)
            const roletype = await connect.find({
                where: { role_name: role.role_name}
            });
            if (roletype.length > 0) {
                logging.error(NAMESPACE, "Duplicate role name.");
                throw 'Duplicate role name.';
            }

            const result = await connect.save(role);
            logging.info(NAMESPACE, "Save role successfully.");
            try {
                const res = await this.retrieveByID(result.role_id);
                return res;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveByID from insert role');
                throw err;
            }  
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
    
    async update(role:Role): Promise<Role> {
        try { 
            const connect = AppDataSource.getRepository(Role)
            const roletype = await connect.find({
                where: { role_name: role.role_name}
            });
            if (roletype.length > 0) {
                for (let i = 0; i < roletype.length; i++) {
                    if (roletype[i].role_id !== role.role_id) {
                        logging.error(NAMESPACE, "Duplicate role name.");
                        throw 'Duplicate role name.';
                    }
                }
            }
            const result = await connect.update({ role_id : role.role_id}, role);
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found role with id: " + role.role_id);
                throw 'Not found role with id: ' + role.role_id;
            }
            logging.info(NAMESPACE, "Update role successfully.");
            try {
                const res = await this.retrieveByID(role.role_id);
                return res;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveByID from update role');
                throw err;
            }
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async retrieveAll():Promise<Role[]>{
        try {
            const result = await AppDataSource.getRepository(Role).find();
            logging.info(NAMESPACE, "Get role by name successfully.");
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message,err);
            throw err;
        }
    }

    async retrieveByName(name:string): Promise<Role> {
        try {
            const result = await AppDataSource.getRepository(Role).findOne({
                where: { role_name : name },
                select: ["role_id","role_name"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found role with name: " + name);
                throw 'Not found role with name: ' + name;
            }
            logging.info(NAMESPACE, "Get role by name successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message,err);
            throw err; 
        }
    }

    async retrieveByID(roleid: number): Promise<Role> {
        try { 
            const result = await AppDataSource.getRepository(Role).findOne({
                where: { role_id : roleid },
                select: ["role_id","role_name"]
            });
            if (!result) {
                logging.error(NAMESPACE, "Not found role with id: " + roleid);
                throw 'Not found role with id: ' + roleid;
            }
            logging.info(NAMESPACE, "Get role by id successfully.");
            return result;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message,err);
            throw err; 
        }
    }

    async deleteByID(roleid: number): Promise<number>{
        try {
            const connect = AppDataSource.getRepository(Role)
            const result = await connect.delete({role_id: roleid});
            if (result.affected === 0) {
                logging.error(NAMESPACE, "Not found role with id: " + roleid);
                throw 'Not found role with id: ' + roleid;
            }
            logging.info(NAMESPACE, "Delete role successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message,err);
            throw err;
        }
    }

    async deleteAll(): Promise<number>{
        try {
            const result = await AppDataSource.getRepository(Role).delete({})
            logging.info(NAMESPACE, "Delete all role successfully.");
            return result.affected!;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message,err);
            throw err;
        }
    }
}

export default new ROleRepository();