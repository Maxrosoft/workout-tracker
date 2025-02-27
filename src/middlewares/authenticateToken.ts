import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ErrorMessageI } from "./errorHandler";

export default function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        const errorMessage: ErrorMessageI = { type: "error", message: "Unauthorized", code: 401 };
        return res.status(errorMessage.code).send(errorMessage);
    }
    try {
        const { id } = jwt.verify(token, process.env.TOKEN_SECRET as string) as any;
        (req as any).userId = id;
        next();
    } catch (error) {
        next(error);
    }
}
