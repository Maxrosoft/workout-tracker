import { Request, Response, NextFunction } from "express";
import { ErrorMessageI } from "../middlewares/errorHandler";
import { SuccessMessageI } from "../app";
import Workout from "../models/Workout";
import Exercise from "../models/Exercise";
import Schedule from "../models/Schedule";
import Comment from "../models/Comment";
import sequelize from "../config/sequelize";

class WorkoutController {
    async createWorkout(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, exercises } = req.body;
            const userId = (req as any).userId;
            if (!name || !exercises || exercises.length === 0) {
                const errorMessage: ErrorMessageI = {
                    type: "error",
                    message: "Missing required parameter",
                    code: 400,
                };
                return res.status(errorMessage.code).send(errorMessage);
            }

            const createdWorkout: any = await Workout.create({ name, UserId: userId });
            const createdExercises: any[] = [];

            for (let exercise of exercises) {
                if (
                    !(
                        exercise.name &&
                        exercise.numberOfSets &&
                        exercise.repetitionsPerSet &&
                        exercise.muscleGroup
                    )
                ) {
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
                const errorMessage: ErrorMessageI = {
                    type: "error",
                    message: "Missing required parameter",
                    code: 400,
                };
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
                            !(
                                exercise.name &&
                                exercise.numberOfSets &&
                                exercise.repetitionsPerSet &&
                                exercise.muscleGroup
                            )
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
                    return next(error);
                }
            } else {
                const errorMessage: ErrorMessageI = {
                    type: "error",
                    message: "Workout not found",
                    code: 404,
                };
                return res.status(errorMessage.code).send(errorMessage);
            }
        } catch (error) {
            next(error);
        }
    }

    async deleteWorkout(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).userId;
            const { workoutId } = req.params;

            if (isNaN(+workoutId)) {
                const errorMessage: ErrorMessageI = { type: "error", message: "Invalid id", code: 400 };
                return res.status(errorMessage.code).send(errorMessage);
            }

            const deletedWorkout = await Workout.findOne({ where: { UserId: userId, id: workoutId } });
            if (deletedWorkout) {
                await deletedWorkout.destroy();
                const successMessage: SuccessMessageI = {
                    type: "success",
                    message: "Workout deleted successfully",
                    code: 200,
                };
                res.status(successMessage.code).send(successMessage);
            } else {
                const errorMessage: ErrorMessageI = {
                    type: "error",
                    message: "Workout not found",
                    code: 404,
                };
                return res.status(errorMessage.code).send(errorMessage);
            }
        } catch (error) {
            next(error);
        }
    }

    async addSchedule(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).userId;
            const { workoutId } = req.params;

            const { date, time } = req.body;

            if (!date || !time) {
                const errorMessage: ErrorMessageI = {
                    type: "error",
                    message: "Missing required parameter",
                    code: 400,
                };
                return res.status(errorMessage.code).send(errorMessage);
            }

            const dateTimeString = `${date}T${time}Z`;
            const scheduleDate = new Date(dateTimeString);
            const now = new Date();

            if (scheduleDate.getTime() < now.getTime()) {
                const errorMessage: ErrorMessageI = {
                    type: "error",
                    message: "Invalid date",
                    code: 400,
                };
                return res.status(errorMessage.code).send(errorMessage);
            }

            if (isNaN(+workoutId)) {
                const errorMessage: ErrorMessageI = { type: "error", message: "Invalid id", code: 400 };
                return res.status(errorMessage.code).send(errorMessage);
            }

            const foundWorkout: any = await Workout.findOne({ where: { UserId: userId, id: workoutId } });
            if (foundWorkout) {
                const t = await sequelize.transaction();
                try {
                    await Schedule.destroy({ where: { WorkoutId: foundWorkout.id } });
                    const createdSchedule: any = await Schedule.create({
                        date,
                        time,
                        WorkoutId: foundWorkout.id,
                    });

                    await t.commit();

                    if (createdSchedule) {
                        const successMessage: SuccessMessageI = {
                            type: "success",
                            message: "Schedule added successfully",
                            data: {
                                id: foundWorkout.id,
                                name: foundWorkout.name,
                                UserId: foundWorkout.UserId,
                                schedule: createdSchedule,
                            },
                            code: 200,
                        };
                        res.status(successMessage.code).send(successMessage);
                    }
                } catch (error) {
                    await t.rollback();
                    return next(error);
                }
            } else {
                const errorMessage: ErrorMessageI = {
                    type: "error",
                    message: "Workout not found",
                    code: 404,
                };
                return res.status(errorMessage.code).send(errorMessage);
            }
        } catch (error) {
            next(error);
        }
    }

    async addComment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).userId;
            const { workoutId } = req.params;

            const { content } = req.body;

            if (isNaN(+workoutId)) {
                const errorMessage: ErrorMessageI = { type: "error", message: "Invalid id", code: 400 };
                return res.status(errorMessage.code).send(errorMessage);
            }

            if (!content) {
                const errorMessage: ErrorMessageI = {
                    type: "error",
                    message: "Missing required parameter",
                    code: 400,
                };
                return res.status(errorMessage.code).send(errorMessage);
            }

            const foundWorkout: any = await Workout.findOne({ where: { id: workoutId } });

            if (foundWorkout) {
                await Comment.create({ content, WorkoutId: foundWorkout.id, UserId: userId });
                const commentsOfWorkout: any[] = await Comment.findAll({ where: { WorkoutId: workoutId } });
                const successMessage: SuccessMessageI = {
                    type: "success",
                    message: "Comment added successfully",
                    data: {
                        id: foundWorkout.id,
                        name: foundWorkout.name,
                        UserId: foundWorkout.UserId,
                        comments: commentsOfWorkout,
                    },
                    code: 201,
                };
                res.status(successMessage.code).send(successMessage);
            } else {
                const errorMessage: ErrorMessageI = {
                    type: "error",
                    message: "Workout not found",
                    code: 404,
                };
                return res.status(errorMessage.code).send(errorMessage);
            }
        } catch (error) {
            next(error);
        }
    }
}

export default WorkoutController;
