import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ErrorMessageI } from "./errorHandler";
import "dotenv/config";

const TOKEN_SECRET = process.env.TOKEN_SECRET as string;

export default function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;    

    if (token == null) {
        const errorMessage: ErrorMessageI = { type: "error", message: "Unauthorized", code: 401 };
        return res.status(errorMessage.code).send(errorMessage);
    }
    try {
        const { id } = jwt.verify(token, TOKEN_SECRET) as any;
        (req as any).userId = id;
        next();
    } catch (error) {
        next(error);
    }
}
