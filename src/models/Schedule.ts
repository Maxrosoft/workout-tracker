import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize";
import Workout from "./Workout";
import User from "./User";

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
            allowNull: false,
        },
    },
    { tableName: "Schedules", timestamps: false }
);

Schedule.belongsTo(Workout, { foreignKey: "WorkoutId", onDelete: "CASCADE", hooks: true });
Workout.hasMany(Schedule, { foreignKey: "WorkoutId", onDelete: "CASCADE" });

Schedule.belongsTo(User, { foreignKey: "UserId", onDelete: "CASCADE", hooks: true });
User.hasMany(Schedule, { foreignKey: "UserId", onDelete: "CASCADE" });

export default Schedule;

