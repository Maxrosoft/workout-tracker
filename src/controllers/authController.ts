import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { ErrorMessageI } from "../middlewares/errorHandler";
import { SuccessMessageI } from "../app";
import "dotenv/config";

function generateAccessToken(id: number) {
    return jwt.sign({ id }, process.env.TOKEN_SECRET as string, { expiresIn: "8h" });
}

class AuthController {
    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, firstName, lastName, password } = req.body;
            if (!(email && firstName && lastName && password)) {
                const errorMessage: ErrorMessageI = { type: "error", message: "Missing required parameter", code: 400 };
                return res.status(errorMessage.code).send(errorMessage);
            }

            const saltRounds: number = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);

            const createdUser: any = await User.create({
                email,
                firstName,
                lastName,
                hashedPassword,
            });

            const token = generateAccessToken(createdUser.id);
            res.setHeader("Authorization", `Bearer ${token}`);

            const successMessage: SuccessMessageI = {
                type: "success",
                message: "User signed up successfully",
                data: {
                    id: createdUser.id,
                    email: createdUser.email,
                    firstName: createdUser.firstName,
                    lastName: createdUser.lastName,
                    token
                },
                code: 201,
            };
            res.status(successMessage.code).send(successMessage);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            if (!(email && password)) {
                const errorMessage: ErrorMessageI = { type: "error", message: "Missing required parameter", code: 400 };
                return res.status(errorMessage.code).send(errorMessage);
            }

            const foundUser: any = await User.findOne({ where: { email } });
            if (foundUser) {
                const storedHashedPassword = foundUser.hashedPassword;
                const comparison = await bcrypt.compare(password, storedHashedPassword);
                if (comparison) {
                    const token = generateAccessToken(foundUser.id);
                    res.setHeader("Authorization", `Bearer ${token}`);
                    const successMessage: SuccessMessageI = {
                        type: "success",
                        message: "User logged in successfully",
                        data: {
                            id: foundUser.id,
                            email: foundUser.email,
                            firstName: foundUser.firstName,
                            lastName: foundUser.lastName,
                            token
                        },
                        code: 200,
                    };
                    res.status(successMessage.code).send(successMessage);
                } else {
                    const errorMessage: ErrorMessageI = {
                        type: "error",
                        message: "Invalid email or password",
                        code: 401,
                    };
                    return res.status(errorMessage.code).send(errorMessage);
                }
            } else {
                const errorMessage: ErrorMessageI = { type: "error", message: "Invalid email or password", code: 401 };
                return res.status(errorMessage.code).send(errorMessage);
            }
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            res.setHeader("Authorization", "");
            const successMessage: SuccessMessageI = { type: "success", message: "Logged out successfully", code: 200 };
            res.status(successMessage.code).send(successMessage);
        } catch (error) {
            next(error);
        }
    }
}

export default AuthController;
