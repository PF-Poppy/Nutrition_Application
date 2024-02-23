type NutritionSummary = {
    [key: string]: {
        minValue_intersect: number;
        maxValue_intersect: number;
        unit: string;
    };
};

export {
    NutritionSummary
}