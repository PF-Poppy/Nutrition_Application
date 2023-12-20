import userRespository from "../repositories/user.respository";
import roleRespository from "../repositories/role.respository";
import userroleRepository from "../repositories/userrole.repository";
import logging from "../config/logging";

const NAMESPACE = "CheckUserAdminRole";

interface ICheckUserAdminRole {
    checkUserManagementAdmin(userId:string): Promise<boolean>;
    checkPetFoodManagementAdmin(userId:string): Promise<boolean>;
}

class CheckUserAdminRole implements ICheckUserAdminRole {
    async checkUserManagementAdmin(userId:string): Promise<boolean> {
        logging.info(NAMESPACE, 'Check User Management Admin Role');
        try {

            const user = await userRespository.retrieveById(userId); 
            if (!user) {
                return false;
            }

            const userRoles = await userroleRepository.retrieveByUserId(userId);
            if (userRoles.length == 0) {
                return false;
            }

            const usermanagementadmin = await roleRespository.retrieveByName('UserManagementAdmin');
            if (!usermanagementadmin) {
                return false;
            }

            const isUserManagementAdmin = userRoles.some(userRole => userRole.role_id == usermanagementadmin.role_id);
            return isUserManagementAdmin;

        }catch (error) {
            logging.error(NAMESPACE, 'Error checking user_management_admin', error);
            return false;
        }
    }

    async checkPetFoodManagementAdmin(userId:string): Promise<boolean> {
        logging.info(NAMESPACE, 'Check Pet Food Management Admin Role');
        try {

            const user = await userRespository.retrieveById(userId); 
            if (!user) {
                return false;
            }

            const userRoles = await userroleRepository.retrieveByUserId(userId);
            if (userRoles.length == 0) {
                return false;
            }

            const petfoodmanagementadmin = await roleRespository.retrieveByName('PetFoodManagementAdmin');
            if (!petfoodmanagementadmin) {
                return false;
            }
            const isPetFoodManagementAdmin = userRoles.some(userRole => userRole.role_id === petfoodmanagementadmin.role_id);
            return isPetFoodManagementAdmin;

        }catch (error) {
            logging.error(NAMESPACE, 'Error checking petfood_management_admin', error);
            return false;
        }
    }
}

export default new CheckUserAdminRole();
