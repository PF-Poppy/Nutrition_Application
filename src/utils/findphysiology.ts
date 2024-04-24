 export function checkConditionForSelectingPhysiology(ageType:string,activityType:string,neuteringStatus:string): string {
    if (ageType === 'baby'){
        if (activityType === "inactive"){
            if (neuteringStatus === "0"){
                return "Hand2010GiantBreedDog"
            }else if (neuteringStatus === "1"){
                return "Hand2010GiantBreedDog"
            }
        }else if (activityType === "moderateActive"){
            if (neuteringStatus === "0"){
                return "Hand2010GiantBreedDog"
            }else if (neuteringStatus === "1"){
                return "Hand2010GiantBreedDog"
            }
        }else if (activityType === "veryActive "){
            if (neuteringStatus === "0"){
                return "Hand2010GiantBreedDog"
            }else if (neuteringStatus === "1"){
                return "Hand2010GiantBreedDog"
            }
        }
    }else if (ageType === 'adult'){
        if (activityType === "inactive"){
            if (neuteringStatus === "0"){
                return "Hand2010GiantBreedDog"
            }else if (neuteringStatus === "1"){
                return "Hand2010GiantBreedDog"
            }
        }else if (activityType === "moderateActive"){
            if (neuteringStatus === "0"){
                return "Hand2010GiantBreedDog"
            }else if (neuteringStatus === "1"){
                return "Hand2010GiantBreedDog"
            }
        }else if (activityType === "veryActive "){
            if (neuteringStatus === "0"){
                return "Hand2010GiantBreedDog"
            }else if (neuteringStatus === "1"){
                return "Hand2010GiantBreedDog"
            }
        }
    }else if (ageType === 'old'){
        if (activityType === "inactive"){
            if (neuteringStatus === "0"){
                return "Hand2010GiantBreedDog"
            }else if (neuteringStatus === "1"){
                return "Hand2010GiantBreedDog"
            }
        }else if (activityType === "moderateActive"){
            if (neuteringStatus === "0"){
                return "Hand2010GiantBreedDog"
            }else if (neuteringStatus === "1"){
                return "Hand2010GiantBreedDog"
            }
        }else if (activityType === "veryActive "){
            if (neuteringStatus === "0"){
                return "Hand2010GiantBreedDog"
            }else if (neuteringStatus === "1"){
                return "Hand2010GiantBreedDog"
            }   
        }
    }
    return ""
}
