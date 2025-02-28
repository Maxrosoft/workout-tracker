import express, { Express } from "express";
import "dotenv/config";
import sequelize from "./config/sequelize";
import authRouter from "./routes/auth";
import workoutRouter from "./routes/workout";
import { errorHandler } from "./middlewares/errorHandler";

const PORT: number | string = process.env.PORT || 3000;

export interface SuccessMessageI {
    type: "success";
    message: string;
    data?: object;
    code: number;
}

const app: Express = express();
app.use(express.json());
app.use(authRouter);
app.use(workoutRouter);
app.use(errorHandler);

(async () => {
    try {
        await sequelize.sync();
        console.log("Connection has been established successfully");
        app.listen(PORT, () => {
            console.log(`App is listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Startup Error:", error);
    }
})();
