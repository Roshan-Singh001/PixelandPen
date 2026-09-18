import mysql from 'mysql2/promise';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

export const MyDbName = "Pixel_and_Pen";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DATABASE_PASS,
  database: MyDbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
