import { Request, Response, NextFunction } from "express";
import { ErrorMessageI } from "../middlewares/errorHandler";
import { SuccessMessageI } from "../app";
import Workout from "../models/Workout";
import Exercise from "../models/Exercise";

class WorkoutController {
    async createWorkout(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, exercises } = req.body;
            const userId = (req as any).userId;
            if (!name || exercises.length === 0) {
                const errorMessage: ErrorMessageI = { type: "error", message: "Missing required parameter", code: 400 };
                return res.status(errorMessage.code).send(errorMessage);
            }

            const createdWorkout: any = await Workout.create({ name, UserId: userId});
            const createdExercises: any[] = [];

            for (let exercise of exercises) {
                if (!(exercise.name && exercise.numberOfSets && exercise.repetitionsPerSet && exercise.muscleGroup)) {
                    createdWorkout.destroy();
                    const errorMessage: ErrorMessageI = {
                        type: "error",
                        message: "Missing required parameter",
                        code: 400,
                    };
                    return res.status(errorMessage.code).send(errorMessage);
                } else {
                    const createdExercise: any = await Exercise.create({
                        name: exercise.name,UserID: exercise.UserID,
                        description: exercise.description,
                        numberOfSets: exercise.numberOfSets,
                        repetitionsPerSet: exercise.repetitionsPerSet,
                        muscleGroup: exercise.muscleGroup,
                        WorkoutId: createdWorkout.id,
                    });
                    createdExercises.push(createdExercise);
                }
            }

            const successMessage: SuccessMessageI = {
                type: "success",
                message: "Workout created successfully",
                data: {
                    id: createdWorkout.id,
                    name: createdWorkout.name,
                    UserId: createdWorkout.UserId,
                    exercises: createdExercises,
                },
                code: 201,
            };
            res.status(successMessage.code).send(successMessage);
        } catch (error) {
            next(error);
        }
    }
}

export default WorkoutController;
