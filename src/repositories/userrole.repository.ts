import { UserRole } from "../entity/userrole.entity";
import { Role } from "../entity/role.entity";
import { AppDataSource } from "../db/data-source";
import logging from "../config/logging";

const NAMESPACE = "UserRole Repository";

interface IUserRoleRepository {
    retrieveByID(userid:string): Promise<any[]>;
    save(userrole:UserRole): Promise<UserRole[]>
    deleteByRoleID(roleid:number): Promise<number>;
}

class UserRoleRepository implements IUserRoleRepository {
    async retrieveByID(userid:string) : Promise<any[]>{
        try {
            const result = await AppDataSource.getRepository(UserRole)
            .createQueryBuilder("userrole")
            .innerJoinAndSelect(Role, "role", "role.role_id = userrole.role_role_id")
            .select([
                "role_role_id AS role_id",
                "role.role_name AS role_name"
            ])
            .where("userrole.user_user_id = :userid", { userid: userid })
            .getRawMany();
            return result;
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async save(userrole:UserRole) : Promise<UserRole[]>{
        try {
            const result = await AppDataSource.getRepository(UserRole).save(userrole);
            logging.info(NAMESPACE, 'Insert UserRole successfully.');
            try {
                const role = await this.retrieveByID(result.user_user_id);
                return role;
            }catch (err) {
                logging.error(NAMESPACE, 'Error call retrieveByID from insert userRole');
                throw err;
            }
        } catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }

    async deleteByRoleID(roleid:number): Promise<number> {
        try {
            const connect = AppDataSource.getRepository(UserRole);
            const result = await connect.delete({role_role_id: roleid});
            if (result.affected === 0) {
                logging.info(NAMESPACE, "Not found userrole with role id: " + roleid);
                return 0;
            }
            logging.info(NAMESPACE, "Delete userrole by role id successfully.");
            return result.affected!;
        }catch (err) {
            logging.error(NAMESPACE, (err as Error).message, err);
            throw err;
        }
    }
}

export default new UserRoleRepository();