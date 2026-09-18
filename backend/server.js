import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from 'uuid';
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import adminRouter from './admin.js';
import articleRouter from './article.js';
import contriRouter from './cont.js';
import profileRouter from './profile.js';
import actionRouter from "./actions.js";
import readRouter from "./reader.js";
import { otpLimiter, authLimiter, apiLimiter, publicApiLimiter } from "./rateLimitMiddleware.js";
import db, { MyDbName } from "./db.js";
import { runMigrations } from "./migrations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const app = express();
const PORT = 3000;
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/dashboard/admin', apiLimiter, adminRouter);
app.use('/dashboard/contri', apiLimiter, contriRouter);
app.use('/dashboard/reader', apiLimiter, readRouter);
app.use('/profile', publicApiLimiter, profileRouter);
app.use('/article', publicApiLimiter, articleRouter);
app.use('/action', apiLimiter, actionRouter);

const email_user = process.env.EMAIL_USER;
const email_pass = process.env.EMAIL_PASS;


async function createDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DATABASE_PASS,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${MyDbName}\``
    );

    console.log(`Database "${MyDbName}" is ready.`);
  } finally {
    await connection.end();
  }
}

async function initializeFirstAdmin() {
  try {
    const firstAdminEmail = process.env.FIRST_ADMIN_EMAIL;
    const firstAdminPassword = process.env.FIRST_ADMIN_PASSWORD;
    const firstAdminUsername = process.env.FIRST_ADMIN_USERNAME;

    const checkAdminQuery = "SELECT * FROM users WHERE username = ? AND role = 'Admin'";
    const [adminResult] = await db.execute(checkAdminQuery, [firstAdminUsername]);
    if (adminResult.length > 0) {
      console.log("First admin already initialized.");
      return;
    }

    let a_id = uuidv4();
    const user_id = a_id.replaceAll("-", "_");
    const hashedPassword = await bcrypt.hash(firstAdminPassword, 10);

    const query = "INSERT INTO users (id, email, username, password, role) VALUES (?, ?, ?, ?, ?)";
    await db.execute(query, [`${'admin_' + user_id}`, firstAdminEmail, firstAdminUsername, hashedPassword, "Admin"]);

    const queryAdmin = "INSERT INTO admin (admin_id, email, username, password) VALUES (?, ?, ?, ?)";
    await db.execute(queryAdmin, [`${'admin_' + user_id}`, firstAdminEmail, firstAdminUsername, hashedPassword]);

    console.log("First admin initialized.");
  } catch (error) {
    console.error("Error initializing first admin:", error.message);
  }
}

async function startServer() {
  try {
    await createDatabase();
    await runMigrations();
    await initializeFirstAdmin();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();

app.use(bodyParser.json());

app.get("/check-email/:email", authLimiter, async (req, res) => {
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

app.get("/check-username/:username", authLimiter, async (req, res) => {
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
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email_user,
      pass: email_pass,
    },
  });

  const mailOptions = {
    from: `"Pixel & Pen" <${email_user}>`,
    to: email,
    subject: "Pixel & Pen OTP Code",
    html: `<div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; font-family: 'Segoe UI', sans-serif; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e0e0e0;">
  <div style="text-align: center; padding-bottom: 20px;">
    <h2 style="margin: 0; color: #1E90FF;">🔒 Pixel & Pen OTP Verification</h2>
  </div>

  <p style="font-size: 16px; color: #333;">Hello,</p>

  <p style="font-size: 16px; color: #333;">
    Use the following OTP to complete your verification process:
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <span style="display: inline-block; background: linear-gradient(135deg, #1E90FF, #00BFFF); color: white; padding: 15px 30px; font-size: 28px; letter-spacing: 6px; font-weight: bold; border-radius: 8px;">
      ${otp}
    </span>
  </div>

  <p style="font-size: 14px; color: #555;">
    This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.
  </p>

  <p style="font-size: 14px; color: #555;">
    If you did not request this OTP, please ignore this email.
  </p>

  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

  <p style="font-size: 12px; color: #999; text-align: center;">
    This is an automated message from Pixel & Pen. Do not reply to this email.
  </p>
</div>
`,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send OTP email");
  }
}

app.post("/submit", authLimiter, async (req, res) => {
  let connection;
  try {
    const { email, username, password, RegisterAs } = req.body;
    if (RegisterAs === "Admin") {
      return res.status(400).json({ message: "Admin registration is not allowed." });
    }
    connection = await db.getConnection();
    await connection.beginTransaction();
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const query =
      "INSERT INTO temp_users (email, username, password, role, otp, otp_expiry ) VALUES (?, ?, ?, ?, ?, ?)";
    const [result] = await connection.execute(query, [
      email,
      username,
      hashedPassword,
      RegisterAs,
      otp,
      otpExpiry,
    ]);

    try {
      await sendOtpEmail(email, otp);
      await connection.commit();
      res.status(201).json({
        message: "OTP sent successfully",
        userId: result.insertId,
      });
    } catch (error) {
      console.error("Failed to send OTP:", error);
      await connection.rollback();
      res.status(500).json({
        message: "Failed to send OTP",
        error: error.message,
      });
    }
    finally {
      connection.release();
    }
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to register user" });
  }
  finally {
    connection.release();
  }
});

app.post("/OtpVerification", otpLimiter, async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const { email, otp } = req.body;

    const query =
      "SELECT * FROM temp_users WHERE email = ? ORDER BY id DESC LIMIT 1";
    const [result] = await connection.execute(query, [email]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const {
      username,
      password,
      role,
      otp: storedOtp,
      otp_expiry: otpExpiry,
    } = result[0];

    // Check if OTP matches
    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP expired
    if (new Date() > new Date(otpExpiry)) {
      return res.status(400).json({ message: "OTP has expired" });
    }



    await connection.beginTransaction();

    let a_id = uuidv4();
    const user_id = a_id.replaceAll("-", "_");
    if (role == "Contributor") {
      const moveUserQuery = `
        INSERT INTO users (id) VALUES (?)
      `;
      await connection.execute(moveUserQuery, [`${'cont_' + user_id}`]);

      const updatequery = `UPDATE users
                           SET username = ?, email = ?, password = ?, role = ?
                           WHERE id = ?`;
      await connection.execute(updatequery, [username, email, password, role, `${'cont_' + user_id}`]);

      const slug = username.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');


      const finalSetContri = `INSERT INTO contributor (cont_id,username,slug, email, password) VALUES (?,?,?,?,?)`;
      await connection.execute(finalSetContri, [`${'cont_' + user_id}`, username, slug, email, password]);

      const tableName = `${'cont_' + user_id}` + '_articles';

      const query_cont_articles_table = `CREATE TABLE IF NOT EXISTS ${tableName} (
        slug VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category_id INT NOT NULL,
        description VARCHAR(200),
        content JSON NOT NULL,
        tags JSON,
        thumbnail_url VARCHAR(255),
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        article_status ENUM('Approved', 'Draft', 'Rejected', 'Pending') DEFAULT 'Draft',
        reject_reason VARCHAR(255) DEFAULT NULL,
        reject_date TIMESTAMP DEFAULT NULL,
        approve_date TIMESTAMP DEFAULT NULL,
        pending_date TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (category_id) REFERENCES categories(id)
      )`;
      await connection.execute(query_cont_articles_table);

    }
    else if (role == "Reader") {
      const moveUserQuery = `
        INSERT INTO users (id) VALUES (?)
      `;
      await connection.execute(moveUserQuery, [`${'sub_' + user_id}`]);

      const updatequery = `UPDATE users
                           SET username = ?, email = ?, password = ?, role = ?
                           WHERE id = ?`;
      await connection.execute(updatequery, [username, email, password, role, `${'sub_' + user_id}`]);


      const finalSetSubs = `INSERT INTO reader (sub_id,username, email, password) VALUES (?,?,?,?)`;
      await connection.execute(finalSetSubs, [`${'sub_' + user_id}`, username, email, password]);
    }

    const deleteTempUserQuery = "DELETE FROM temp_users WHERE email = ?";
    await connection.execute(deleteTempUserQuery, [email]);
    await connection.commit();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
  finally {
    connection.release();
  }
});

app.post("/validate", authLimiter, async (req, res) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const { username, password, role } = req.body;

  if (!username || !role || !password) {
    return res
      .status(400)
      .json({ message: "Username, password, and role are required." });
  }

  try {
    var result = '';
    var user_id = '';

    if (role == 'Admin') {
      const query = "SELECT * FROM admin WHERE username = ?";
      const [result1] = await db.execute(query, [username]);
      result = result1;
      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid username or role." });
      }
      user_id = result[0].admin_id;
    }
    else if (role == 'Contributor') {
      const query = "SELECT * FROM contributor WHERE username = ?";
      const [result1] = await db.execute(query, [username]);
      result = result1;
      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid username or role." });
      }
      console.log("hello", result[0])
      user_id = result[0].cont_id;
    }
    else if (role == 'Reader') {
      const query = "SELECT * FROM reader WHERE username = ?";
      const [result1] = await db.execute(query, [username]);
      result = result1;
      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid username or role." });
      }
      user_id = result[0].sub_id;
    }



    const {
      password: hashedPassword,
      username: userName,
    } = result[0];

    const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);

    if (isPasswordCorrect) {
      const token = jwt.sign(
        { id: user_id, role: role, username: userName },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      console.log("Generated JWT token:", token);

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 3600000,
      });

      res.status(200).json({ message: "Login successful", user_id: user_id, role: role });
    } else {
      res.status(401).json({ message: "Incorrect password." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

function verifyToken(req, res, next) {
  const token = req.cookies.token;
  console.log("token is :", token);

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(req.user);
    console.log("role:", req.user.role);
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.get("/auth/profile", authLimiter, verifyToken, (req, res) => {
  res.json({
    username: req.user.username,
    role: req.user.role,
    id: req.user.id,
  });
});

app.post("/logout", authLimiter, (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: false, // Set to true if your site uses HTTPS
    sameSite: "strict",
    expires: new Date(0), // Expire immediately
    path: "/", // Make sure path matches the cookie path used during login
  });

  res.status(200).json({ message: "Logged out successfully" });
});
