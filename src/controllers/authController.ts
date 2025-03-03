import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { ErrorMessageI } from "../middlewares/errorHandler";
import { SuccessMessageI } from "../app";
import "dotenv/config";
import passwordValidator from "../utils/passwordValidator";

const PASSWORD_SECRET = process.env.PASSWORD_SECRET as string;
const TOKEN_SECRET = process.env.TOKEN_SECRET as string;

function generateAccessToken(id: number) {
    return jwt.sign({ id }, TOKEN_SECRET, { expiresIn: "8h" });
}

async function hashPassword(password: string): Promise<string> {
    const hmac = crypto.createHmac("sha256", PASSWORD_SECRET).update(password).digest("hex");
    const saltRounds = 10;
    return await bcrypt.hash(hmac, saltRounds);
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hmac = crypto.createHmac("sha256", PASSWORD_SECRET).update(password).digest("hex");
    return await bcrypt.compare(hmac, hashedPassword);
}

class AuthController {
    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, firstName, lastName, password } = req.body;
            if (!(email && firstName && lastName && password)) {
                const errorMessage: ErrorMessageI = {
                    type: "error",
                    message: "Missing required parameter",
                    code: 400,
                };
                return res.status(errorMessage.code).send(errorMessage);
            }
            if (!passwordValidator.validate(password)) {
                const errorMessage: ErrorMessageI = {
                    type: "error",
                    message:
                        "Password must contain at least 8 characters, including uppercase, lowercase, numbers and must not contain spaces",
                    code: 400,
                };
                return res.status(errorMessage.code).send(errorMessage);
            }

            const hashedPassword = await hashPassword(password);

            const createdUser: any = await User.create({
                email,
                firstName,
                lastName,
                hashedPassword,
            });

            const token = generateAccessToken(createdUser.id);
            res.cookie("token", token, {
                httpOnly: true,
                secure: !req.hostname.includes("localhost"),
                sameSite: "strict",
                maxAge: 8 * 60 * 60 * 1000,
            });

            const successMessage: SuccessMessageI = {
                type: "success",
                message: "User signed up successfully",
                data: {
                    id: createdUser.id,
                    email: createdUser.email,
                    firstName: createdUser.firstName,
                    lastName: createdUser.lastName,
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
                return res.status(400).json({ error: "Missing required parameter" });
            }

            const foundUser: any = await User.findOne({ where: { email } });
            if (!foundUser || !(await verifyPassword(password, foundUser.hashedPassword))) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            const token = generateAccessToken(foundUser.id);

            res.cookie("token", token, {
                httpOnly: true,
                secure: !req.hostname.includes("localhost"),
                sameSite: "strict",
                maxAge: 8 * 60 * 60 * 1000,
            });

            res.status(200).json({
                message: "User logged in successfully",
                user: {
                    id: foundUser.id,
                    email: foundUser.email,
                    firstName: foundUser.firstName,
                    lastName: foundUser.lastName,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            res.cookie("token", "", { maxAge: 0 });
            const successMessage: SuccessMessageI = {
                type: "success",
                message: "Logged out successfully",
                code: 200,
            };
            res.status(successMessage.code).send(successMessage);
        } catch (error) {
            next(error);
        }
    }
}

export default AuthController;
