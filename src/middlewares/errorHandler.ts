import { Request, Response, NextFunction } from "express";

export interface ErrorMessageI {
    type: "error";
    message: string;
    code: number
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    const errorMessage: ErrorMessageI = { type: "error", message: err.message, code: 500};
    res.status(errorMessage.code).send(errorMessage);
};
