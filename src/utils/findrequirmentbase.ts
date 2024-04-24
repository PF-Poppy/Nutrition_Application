export function checkConditionForSelectingRequirmentBase(ageType:string,activityType:string,neuteringStatus:string): string {
    if (ageType === 'baby'){
        if (activityType === "inactive"){
            if (neuteringStatus === "0"){
                return "AAFCO2023AdultMaintenanceDogs"
            }else if (neuteringStatus === "1"){
                return "AAFCO2023AdultMaintenanceDogs"
            }
        }else if (activityType === "moderateActive"){
            if (neuteringStatus === "0"){
                return "AAFCO2023AdultMaintenanceDogs"
            }else if (neuteringStatus === "1"){
                return "AAFCO2023AdultMaintenanceDogs"
            }
        }else if (activityType === "veryActive "){
            if (neuteringStatus === "0"){
                return "AAFCO2023AdultMaintenanceDogs"
            }else if (neuteringStatus === "1"){
                return "AAFCO2023AdultMaintenanceDogs"
            }
        }
    }else if (ageType === 'adult'){
        if (activityType === "inactive"){
            if (neuteringStatus === "0"){
                return "AAFCO2023AdultMaintenanceDogs"
            }else if (neuteringStatus === "1"){
                return "AAFCO2023AdultMaintenanceDogs"
            }
        }else if (activityType === "moderateActive"){
            if (neuteringStatus === "0"){
                return "AAFCO2023AdultMaintenanceDogs"
            }else if (neuteringStatus === "1"){
                return "AAFCO2023AdultMaintenanceDogs"
            }
        }else if (activityType === "veryActive "){
            if (neuteringStatus === "0"){
                return "AAFCO2023AdultMaintenanceDogs"
            }else if (neuteringStatus === "1"){
                return "AAFCO2023AdultMaintenanceDogs"
            }
        }
    }else if (ageType === 'old'){
        if (activityType === "inactive"){
            if (neuteringStatus === "0"){
                return "AAFCO2023AdultMaintenanceDogs"
            }else if (neuteringStatus === "1"){
                return "AAFCO2023AdultMaintenanceDogs"
            }
        }else if (activityType === "moderateActive"){
            if (neuteringStatus === "0"){
                return "AAFCO2023AdultMaintenanceDogs"
            }else if (neuteringStatus === "1"){
                return "AAFCO2023AdultMaintenanceDogs"
            }
        }else if (activityType === "veryActive "){
            if (neuteringStatus === "0"){
                return "AAFCO2023AdultMaintenanceDogs"
            }else if (neuteringStatus === "1"){
                return "AAFCO2023AdultMaintenanceDogs"
            }   
        }
    }
    return ""
}