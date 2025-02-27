import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize";

const User = sequelize.define(
    "User",
    {
        id: {
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        hashedPassword: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [60, 100],
            },
        },
    },
    { tableName: "Users", timestamps: true }
);

export default User;
