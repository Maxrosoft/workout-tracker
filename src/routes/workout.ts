import { Router } from "express";
import WorkoutController from "../controllers/workoutController";
import authenticateToken from "../middlewares/authenticateToken";

const workoutRouter: Router = Router();
const workoutController: WorkoutController = new WorkoutController();

workoutRouter.post("/workout", authenticateToken as any, workoutController.createWorkout as any)
workoutRouter.put("/workout/:workoutId", authenticateToken as any, workoutController.updateWorkout as any)

export default workoutRouter;