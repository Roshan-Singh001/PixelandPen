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
// import db from './db.js';

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
app.use('/dashboard/admin', adminRouter);
app.use('/dashboard/contri', contriRouter);
app.use('/profile', profileRouter);
app.use('/article', articleRouter);
app.use('/action', actionRouter);

const databasePass = process.env.DATABASE_PASS;
const db_host = process.env.DB_HOST;
const db_user = process.env.DB_USER;
const email_user = process.env.EMAIL_USER;
const email_pass = process.env.EMAIL_PASS;



var db;
const MyDbName = "Pixel&Pen";

async function connectToDatabase() {
  try {
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
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(100),
      email VARCHAR(100) ,
      password VARCHAR(255) ,
      role ENUM('Admin', 'Reader', 'Contributor'),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    await db.execute(query_user_table);

    const query_admin_table = `CREATE TABLE IF NOT EXISTS admin (
      admin_id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    await db.execute(query_admin_table);

    const query_contributor_table = `CREATE TABLE IF NOT EXISTS contributor (
      cont_id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      slug VARCHAR(255) UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      bio VARCHAR(255),
      profile_pic VARCHAR(255),
      dob DATE,
      expertise JSON,
      links JSON,
      city VARCHAR(255),
      country VARCHAR(255),
      status ENUM('Pending','Approved', 'Rejected', 'Block') DEFAULT 'Pending',
      reject_reason TEXT DEFAULT NULL,
      followers INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    await db.execute(query_contributor_table);

    const query_subscriber_table = `CREATE TABLE IF NOT EXISTS reader (
      sub_id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      bio VARCHAR(255),
      profile_pic VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    await db.execute(query_subscriber_table);

    const query_likes_table = `CREATE TABLE IF NOT EXISTS article_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reader_id VARCHAR(255),
      article_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(reader_id, article_id),
      FOREIGN KEY (reader_id) REFERENCES reader(sub_id) ON DELETE CASCADE,
      FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE
    )`;

    await db.execute(query_likes_table);

    const query_follow_table = `CREATE TABLE IF NOT EXISTS reader_follows (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reader_id VARCHAR(255),
      contributor_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(reader_id, contributor_id),
      FOREIGN KEY (reader_id) REFERENCES reader(sub_id) ON DELETE CASCADE,
      FOREIGN KEY (contributor_id) REFERENCES contributor(cont_id) ON DELETE CASCADE
    )`;

    await db.execute(query_follow_table);

    const query_bookmark_table = `CREATE TABLE IF NOT EXISTS bookmarks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      reader_id VARCHAR(255),
      article_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(reader_id, article_id),
      FOREIGN KEY (reader_id) REFERENCES reader(sub_id) ON DELETE CASCADE,
      FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE
    )`;

    await db.execute(query_bookmark_table);

    const query_articles_table = `CREATE TABLE IF NOT EXISTS articles (
      article_id VARCHAR(255) PRIMARY KEY,
      slug VARCHAR(255) UNIQUE,
      title VARCHAR(255) NOT NULL,
      category JSON NOT NULL,
      description VARCHAR(200),
      content JSON NOT NULL,
      tags JSON,
      thumbnail_url VARCHAR(255),
      author VARCHAR(255) NOT NULL,
      cont_id VARCHAR(255) NOT NULL,
      views INT DEFAULT 0,
      likes INT DEFAULT 0,
      is_featured BOOLEAN DEFAULT FALSE,
      publish_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    await db.execute(query_articles_table);

    const query_review_article = `CREATE TABLE IF NOT EXISTS review_articles (
      review_id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) UNIQUE,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      cont_id VARCHAR(255) NOT NULL,
      status ENUM('Approved', 'Rejected', 'Pending') DEFAULT 'Pending',
      is_featured BOOLEAN DEFAULT FALSE,
      reject_reason TEXT DEFAULT NULL,
      reject_at TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`;

    await db.execute(query_review_article);

    const query_comment = `CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      article_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status ENUM('Pending', 'Approved', 'Deleted') DEFAULT 'Pending',

      FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`;

    await db.execute(query_comment);

    const query_announce = `CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      audience ENUM('All','Contributors','Readers') DEFAULT 'All',
      status ENUM('Draft','Published') DEFAULT 'Draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published_at DATETIME DEFAULT NULL
    )`;

    await db.execute(query_announce);


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
  }
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
    try {
      await sendOtpEmail(email, otp);

      res.status(201).json({
        message: "OTP sent successfully",
        userId: result.insertId,
      });
    } catch (error) {
      console.error("Failed to send OTP:", error);
      res.status(500).json({
        message: "Failed to send OTP",
        error: error.message,
      });
    }
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

    // Use transaction to move user from temp_user to user atomically
    // Starts a new SQL transaction so that either both the insert and delete happen, or none do. Ensures atomicity (no partial operations).
    await db.beginTransaction();

    let a_id = uuidv4();
    const user_id = a_id.replaceAll("-","_");
    if (role == "Admin") {
      const moveUserQuery = `
        INSERT INTO users (id) VALUES (?)
      `;
      await db.execute(moveUserQuery, [`${'admin_'+user_id}`]);
      
      const updatequery = `UPDATE users
                           SET username = ?, email = ?, password = ?, role = ?
                           WHERE id = ?`;
      await db.execute(updatequery, [username,email,password,role,`${'admin_'+user_id}`]);

      const finalSetAdmin = `INSERT INTO admin (admin_id,username, email, password) VALUES (?,?,?,?)`;
      await db.execute(finalSetAdmin, [`${'admin_'+user_id}`,username, email, password]);
    } 
    else if (role == "Contributor") {
      const moveUserQuery = `
        INSERT INTO users (id) VALUES (?)
      `;
      await db.execute(moveUserQuery, [`${'cont_'+user_id}`]);
      
      const updatequery = `UPDATE users
                           SET username = ?, email = ?, password = ?, role = ?
                           WHERE id = ?`;
      await db.execute(updatequery, [username,email,password,role,`${'cont_'+user_id}`]);

      const slug = username.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');


      const finalSetContri = `INSERT INTO contributor (cont_id,username,slug, email, password) VALUES (?,?,?,?,?)`;
      await db.execute(finalSetContri, [`${'cont_'+user_id}`,username,slug, email, password]);

      const tableName = `${'cont_'+user_id}` + '_articles';

      const query_cont_articles_table = `CREATE TABLE IF NOT EXISTS ${tableName} (
        slug VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category JSON,
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`;
      await db.execute(query_cont_articles_table);

    } 
    else if (role == "Reader") {
      const moveUserQuery = `
        INSERT INTO users (id) VALUES (?)
      `;
      await db.execute(moveUserQuery, [`${'sub_'+user_id}`]);
      
      const updatequery = `UPDATE users
                           SET username = ?, email = ?, password = ?, role = ?
                           WHERE id = ?`;
      await db.execute(updatequery, [username,email,password,role,`${'sub_'+user_id}`]);


      const finalSetSubs = `INSERT INTO reader (sub_id,username, email, password) VALUES (?,?,?,?)`;
      await db.execute(finalSetSubs, [`${'sub_'+user_id}`,username, email, password]);
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
      console.log("hello",result[0])
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
        { expiresIn: "1h" }
      );

      // Set token in cookie properly:
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // set true if using HTTPS in production
        sameSite: "lax",
        maxAge: 3600000,
      });

      // Send token in response JSON as well
      res.status(200).json({ message: "Login successful",user_id: user_id, role: role, token });
    } else {
      res.status(401).json({ message: "Incorrect password." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("token is :", token);

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded contains { id, username, role }
    console.log(req.user);
    console.log("role:", req.user.role);
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.get("/auth/profile", verifyToken, (req, res) => {
  res.json({
    username: req.user.username,
    role: req.user.role,
    id: req.user.id,
  });
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
