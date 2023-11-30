import { Request, Response } from "express";

export const getDefault = (req: Request, res: Response) => {
    res.json({
        message: "API is working"
    });
};