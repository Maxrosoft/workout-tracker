import { Router } from "express";
import AuthController from "../controllers/authController";

const authRouter: Router = Router();
const authController: AuthController = new AuthController();

authRouter.post("/signup", authController.signup as any);
authRouter.post("/login", authController.login as any);
authRouter.post("/logout", authController.logout as any);

export default authRouter;
