import { DataTypes } from "sequelize";
import User from "./User";
import sequelize from "../config/sequelize";

const Workout = sequelize.define(
    "Workout",
    {
        id: {
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    { tableName: "Workouts", timestamps: true }
);

Workout.belongsTo(User, { foreignKey: "UserId", onDelete: "CASCADE", hooks: true });
User.hasMany(Workout, { foreignKey: "UserId", onDelete: "CASCADE" });

export default Workout;

