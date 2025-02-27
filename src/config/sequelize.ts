import { Sequelize } from "sequelize";
import "dotenv/config";

const POSTGRES_URL: string | undefined = process.env.POSTGRES_URL;

const sequelize = new Sequelize(POSTGRES_URL as string);

export default sequelize;
