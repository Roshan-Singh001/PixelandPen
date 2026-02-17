import mysql from 'mysql2/promise';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const db_host = process.env.DB_HOST || "localhost";
const db_user = process.env.MYSQL_USER || process.env.DB_USER || "root";
const databasePass =
  process.env.MYSQL_PASSWORD ||
  process.env.MYSQL_ROOT_PASSWORD ||
  process.env.DATABASE_PASS ||
  "";
const MyDbName = process.env.MYSQL_DATABASE || "Pixel_and_Pen";

const pool = mysql.createPool({
    host: db_host,
    user: db_user,
    password: databasePass,
    database: MyDbName,
});

export default pool;
