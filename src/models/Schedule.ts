import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize";
import Workout from "./Workout";

const Schedule = sequelize.define(
    "Schedule",
    {
        id: {
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        time: {
            type: DataTypes.TIME,
            allowNull: true,
        },
    },
    { tableName: "Schedules", timestamps: false }
);

Schedule.belongsTo(Workout, { foreignKey: "WorkoutId" }); 
Workout.hasMany(Schedule, { foreignKey: "WorkoutId" });

Schedule.belongsTo(Workout);
export default Schedule;
