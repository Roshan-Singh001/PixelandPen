import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

const app = express();
const PORT = 3000;

let db;
const MyDbName = "Pixel&Pen";

async function connectToDatabase() {
  try {
    // First, connect to MySQL server (no database yet)
    const serverConnection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "110619Suraj@",
    });

    await serverConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${MyDbName}\`;`
    );
    console.log(`Database "${MyDbName}" created or already exists.`);
    await serverConnection.end();

    // Now connect to the actual database
    db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "110619Suraj@",
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
app.use(cors());

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
      "SELECT otp, otp_expiry FROM temp_users WHERE email = ? ORDER BY id DESC LIMIT 1";
    const [result] = await db.execute(query, [email]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const { otp: storedOtp, otp_expiry: otpExpiry } = result[0];

    // Check if OTP matches
    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP expired
    if (new Date() > new Date(otpExpiry)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Use transaction to move user from temp_user to user atomically
    await db.beginTransaction();

    const moveUserQuery = `
      INSERT INTO users (username, email, password, role)
      SELECT username, email, password, role FROM temp_users WHERE email = ? AND otp = ?
    `;
    await db.execute(moveUserQuery, [email, otp]);

    const deleteTempUserQuery = "DELETE FROM temp_users WHERE email = ?";
    await db.execute(deleteTempUserQuery, [email]);

    await db.commit();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    await db.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});
