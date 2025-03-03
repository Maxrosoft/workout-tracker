import { Router } from "express";
import WorkoutController from "../controllers/workoutController";
import authenticateToken from "../middlewares/authenticateToken";

const workoutRouter: Router = Router();
const workoutController: WorkoutController = new WorkoutController();

workoutRouter.post("/workout", authenticateToken as any, workoutController.createWorkout as any);
workoutRouter.put("/workout/:workoutId", authenticateToken as any, workoutController.updateWorkout as any);
workoutRouter.delete("/workout/:workoutId", authenticateToken as any, workoutController.deleteWorkout as any);
workoutRouter.post(
    "/workout/:workoutId/schedule",
    authenticateToken as any,
    workoutController.addSchedule as any
);
workoutRouter.post(
    "/workout/:workoutId/comment",
    authenticateToken as any,
    workoutController.addComment as any
);

export default workoutRouter;
