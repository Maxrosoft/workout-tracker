import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize";
import Workout from "./Workout";

const Exercise = sequelize.define("Exercise", {
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
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    numberOfSets: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    repetitionsPerSet: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    muscleGroup: {
        type: DataTypes.ENUM("chest", "back", "legs", "shoulders", "arms", "core"),
        allowNull: false,
    },
}, { tableName: "Exercises", timestamps: false });

Exercise.belongsTo(Workout, { foreignKey: "WorkoutId", onDelete: "CASCADE", hooks: true });
Workout.hasMany(Exercise, { foreignKey: "WorkoutId", onDelete: "CASCADE" });

export default Exercise;

