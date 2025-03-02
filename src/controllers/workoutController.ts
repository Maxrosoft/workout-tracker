import { Request, Response, NextFunction } from "express";
import { ErrorMessageI } from "../middlewares/errorHandler";
import { SuccessMessageI } from "../app";
import Workout from "../models/Workout";
import Exercise from "../models/Exercise";
import sequelize from "../config/sequelize";

class WorkoutController {
    async createWorkout(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, exercises } = req.body;
            const userId = (req as any).userId;
            if (!name || !exercises || exercises.length === 0) {
                const errorMessage: ErrorMessageI = { type: "error", message: "Missing required parameter", code: 400 };
                return res.status(errorMessage.code).send(errorMessage);
            }

            const createdWorkout: any = await Workout.create({ name, UserId: userId });
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
                        name: exercise.name,
                        UserID: exercise.UserID,
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

    async updateWorkout(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, exercises } = req.body;
            const userId = (req as any).userId;
            const { workoutId } = req.params;
            if (!name || !exercises || exercises.length === 0) {
                const errorMessage: ErrorMessageI = { type: "error", message: "Missing required parameter", code: 400 };
                return res.status(errorMessage.code).send(errorMessage);
            }
            if (isNaN(+workoutId)) {
                const errorMessage: ErrorMessageI = { type: "error", message: "Invalid id", code: 400 };
                return res.status(errorMessage.code).send(errorMessage);
            }

            const foundWorkout: any = await Workout.findOne({ where: { id: +workoutId, UserId: userId } });

            if (foundWorkout) {
                const t = await sequelize.transaction();
                try {
                    const createdExercises: any[] = [];
                    await foundWorkout.update({ name });
                    await Exercise.destroy({ where: { WorkoutId: foundWorkout.id } });
                    for (let exercise of exercises) {
                        if (
                            !(exercise.name && exercise.numberOfSets && exercise.repetitionsPerSet && exercise.muscleGroup)
                        ) {
                            const errorMessage: ErrorMessageI = {
                                type: "error",
                                message: "Missing required parameter",
                                code: 400,
                            };
                            res.status(errorMessage.code).send(errorMessage);
                            throw new Error("Missing required parameter");
                        } else {
                            const createdExercise: any = await Exercise.create({
                                name: exercise.name,
                                UserID: exercise.UserID,
                                description: exercise.description,
                                numberOfSets: exercise.numberOfSets,
                                repetitionsPerSet: exercise.repetitionsPerSet,
                                muscleGroup: exercise.muscleGroup,
                                WorkoutId: foundWorkout.id,
                            });
                            createdExercises.push(createdExercise);
                        }
                    }
                    await t.commit();

                    const successMessage: SuccessMessageI = {
                        type: "success",
                        message: "Workout updated successfully",
                        data: {
                            id: foundWorkout.id,
                            name: foundWorkout.name,
                            UserId: foundWorkout.UserId,
                            exercises: createdExercises,
                        },
                        code: 200,
                    };
                    res.status(successMessage.code).send(successMessage);
                } catch (error) {
                    await t.rollback();
                }
                
            } else {
                const errorMessage: ErrorMessageI = { type: "error", message: "Workout not found", code: 404 };
                return res.status(errorMessage.code).send(errorMessage);
            }
        } catch (error) {
            next(error);
        }
    }
}

export default WorkoutController;
