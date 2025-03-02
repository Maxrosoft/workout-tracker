import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize";
import Workout from "./Workout";
import User from "./User";

const Comment = sequelize.define("Comment", {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, { tableName: "Comments", timestamps: true });

Comment.belongsTo(Workout, { foreignKey: "WorkoutId", onDelete: "CASCADE", hooks: true });
Workout.hasMany(Comment, { foreignKey: "WorkoutId", onDelete: "CASCADE" });

Comment.belongsTo(User, { foreignKey: "UserId", onDelete: "CASCADE", hooks: true });
User.hasMany(Comment, { foreignKey: "UserId", onDelete: "CASCADE" });

export default Comment;

