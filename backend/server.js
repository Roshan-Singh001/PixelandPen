import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const app = express();
const PORT = 3000;
app.use(cookieParser());
app.use(express.json());

const databasePass = process.env.DATABASE_PASS;
const db_host = process.env.DB_HOST;
const db_user = process.env.DB_USER;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

let db;
const MyDbName = "Pixel&Pen";

async function connectToDatabase() {
  try {
    // First, connect to MySQL server (no database yet)
    const serverConnection = await mysql.createConnection({
      host: db_host,
      user: db_user,
      password: databasePass,
    });

    await serverConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${MyDbName}\`;`
    );
    console.log(`Database "${MyDbName}" created or already exists.`);
    await serverConnection.end();

    db = await mysql.createConnection({
      host: db_host,
      user: db_user,
      password: databasePass,
      database: MyDbName,
    });

    const query_temp_user_table = `CREATE TABLE IF NOT EXISTS temp_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL ,
      password VARCHAR(255) NOT NULL,
      role ENUM('Admin', 'Reader', 'Contributor') NOT NULL,
      otp VARCHAR(10),
      otp_expiry DATETIME
    )`;
    await db.execute(query_temp_user_table);

    const query_user_table = `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('Admin', 'Reader', 'Contributor') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    await db.execute(query_user_table);

    const query_admin_table = `CREATE TABLE IF NOT EXISTS admin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
    )`;
    await db.execute(query_admin_table);

    const query_contributor_table = `CREATE TABLE IF NOT EXISTS contributor (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
    )`;
    await db.execute(query_contributor_table);

    const query_subscriber_table = `CREATE TABLE IF NOT EXISTS reader (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
    )`;
    await db.execute(query_subscriber_table);

  } catch (error) {
    console.error("Database connection error:", error.message);
  }
}

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

app.use(bodyParser.json());

app.get("/check-email/:email", async (req, res) => {
  try {
    let email = req.params.email;
    const query = "SELECT * FROM users WHERE email = ?";
    const [result] = await db.execute(query, [email]);
    if (result.length > 0) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.log("error occurred while fetching", err);
  }
});

app.get("/check-username/:username", async (req, res) => {
  try {
    let username = req.params.username;
    const query = "SELECT * FROM users WHERE username = ?";
    const [result] = await db.execute(query, [username]);
    if (result.length > 0) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.log("error occurred while fetching", err);
  }
});

async function sendOtpEmail(email, otp) {
  const TOKEN = "b2e4768a5485a5d6482f143fcd5e9614";

  const transport = Nodemailer.createTransport(
    MailtrapTransport({
      token: TOKEN,
    })
  );

  const sender = {
    address: "hello@demomailtrap.com",
    name: "Mailtrap Test",
  };
  const recipients = [email];

  transport
    .sendMail({
      from: sender,
      to: recipients,
      subject: "Pixel & Pen OTP Code",
      text: `your OTP is ${otp} It is valid till 10 minutes`,
      category: "Integration Test",
    })
    .then(console.log, console.error);
}

app.post("/submit", async (req, res) => {
  try {
    const { email, username, password, RegisterAs } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const query =
      "INSERT INTO temp_users (email, username, password, role, otp, otp_expiry ) VALUES (?, ?, ?, ?, ?, ?)";
    const [result] = await db.execute(query, [
      email,
      username,
      hashedPassword,
      RegisterAs,
      otp,
      otpExpiry,
    ]);
    console.log(otp);
    await sendOtpEmail(email, otp);
    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

app.post("/OtpVerification", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Fetch OTP and expiry for the given email from temp_user
    const query =
      "SELECT * FROM temp_users WHERE email = ? ORDER BY id DESC LIMIT 1";
    const [result] = await db.execute(query, [email]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const { username, password, role,otp: storedOtp, otp_expiry: otpExpiry } = result[0];

    // Check if OTP matches
    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP expired
    if (new Date() > new Date(otpExpiry)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Use transaction to move user from temp_user to user atomically
    // Starts a new SQL transaction so that either both the insert and delete happen, or none do. Ensures atomicity (no partial operations).
    await db.beginTransaction();

    const moveUserQuery = `
      INSERT INTO users (username, email, password, role)
      SELECT username, email, password, role FROM temp_users WHERE email = ? AND otp = ?
    `;
    await db.execute(moveUserQuery, [email, otp]);

    if (role == "Admin") {
      const finalSetAdmin = `INSERT INTO admin (username, email, password) VALUES (?,?,?)`;
      await db.execute(finalSetAdmin,[username,email,password]);
    }
    else if(role == "Contributor"){
      const finalSetContri = `INSERT INTO contributor (username, email, password) VALUES (?,?,?)`;
      await db.execute(finalSetContri,[username,email,password]);
    }
    else if(role == "Reader"){
      const finalSetSubs = `INSERT INTO reader (username, email, password) VALUES (?,?,?)`;
      await db.execute(finalSetSubs,[username,email,password]);
    }

    const deleteTempUserQuery = "DELETE FROM temp_users WHERE email = ?";
    await db.execute(deleteTempUserQuery, [email]);

    await db.commit(); //If everything succeeded, the changes are saved permanently with commit.

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    await db.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

app.post("/validate", async (req, res) => {
  const JWT_SECRET = "MY_SECRET";
  const { username, password, role } = req.body;

  if (!username || !role || !password) {
    return res
      .status(400)
      .json({ message: "Username, password, and role are required." });
  }

  try {
    const query = "SELECT * FROM users WHERE username = ? AND role = ?";
    const [result] = await db.execute(query, [username, role]);

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid username or role." });
    }

    const {
      password: hashedPassword,
      id: userId,
      username: userName,
    } = result[0];

    const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);

    if (isPasswordCorrect) {
      const token = jwt.sign(
        { id: userId, role: role, username: userName },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Set token in cookie properly:
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // set true if using HTTPS in production
        sameSite: "lax",
        maxAge: 3600000, // 1 hour
      });

      // Send token in response JSON as well
      res.status(200).json({ message: "Login successful", token });
    } else {
      res.status(401).json({ message: "Incorrect password." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: false, // Set to true if your site uses HTTPS
    sameSite: "strict",
    expires: new Date(0), // Expire immediately
    path: "/", // Make sure path matches the cookie path used during login
  });

  res.status(200).json({ message: "Logged out successfully" });
});
