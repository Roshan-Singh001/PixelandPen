import mysql from 'mysql2/promise';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const databasePass = process.env.DATABASE_PASS;
const db_host = process.env.DB_HOST;
const db_user = process.env.DB_USER;
const MyDbName = "Pixel_and_Pen";

const pool = mysql.createPool({
    host: db_host,
    user: db_user,
    password: databasePass,
    database: MyDbName,
});

export default pool;
