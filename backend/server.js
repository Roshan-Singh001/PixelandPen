import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from 'uuid';
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import adminRouter from './admin.js';
import articleRouter from './article.js';
import contriRouter from './cont.js';
import profileRouter from './profile.js';
import actionRouter from "./actions.js";
import readRouter from "./reader.js";
import { otpLimiter, authLimiter, apiLimiter, publicApiLimiter, passwordResetLimiter } from "./rateLimitMiddleware.js";
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
    html: `<div style="margin:0; padding:40px 16px; background:#FAFAF8; font-family:Inter, Arial, Helvetica, sans-serif; color:#1F2937;">

  <div style="max-width:560px; margin:0 auto;">

    <!-- Email Card -->
    <div style="background:#FFFFFF; border:1px solid #E5E7EB; border-radius:16px; overflow:hidden;">

      <!-- Header -->
      <div style="padding:32px 36px 26px; border-bottom:1px solid #E5E7EB; text-align:center;">

        <img
          src="https://raw.githubusercontent.com/Roshan-Singh001/PixelandPen/main/frontend/src/assets/images/Pixel%20%26%20Pen(Main-New).png"
          alt="Pixel & Pen"
          style="height:42px; width:auto; display:inline-block;"
        />

      </div>

      <!-- Content -->
      <div style="padding:40px 36px 36px;">

        <div style="margin-bottom:28px;">
          <p style="margin:0 0 8px; font-size:11px; line-height:1.4; letter-spacing:2px; text-transform:uppercase; font-weight:600; color:#F59E0B;">
            Password reset
          </p>

          <h1 style="margin:0; font-family:'Newsreader', Georgia, serif; font-size:34px; line-height:1.15; font-weight:500; letter-spacing:-0.5px; color:#1E3A5F;">
            Let's get you back in.
          </h1>
        </div>

        <p style="margin:0 0 18px; font-size:15px; line-height:1.7; color:#1F2937;">
          Hello,
        </p>

        <p style="margin:0 0 26px; font-size:15px; line-height:1.7; color:#6B7280;">
          We received a request to reset the password for your
          <strong style="color:#1F2937;">Pixel & Pen</strong> account.
          Use the verification code below to continue.
        </p>

        <!-- OTP -->
        <div style="margin:30px 0; padding:26px 20px; background:#FAFAF8; border:1px solid #E5E7EB; border-radius:12px; text-align:center;">

          <p style="margin:0 0 12px; font-size:11px; line-height:1.4; letter-spacing:1.8px; text-transform:uppercase; font-weight:600; color:#6B7280;">
            Verification code
          </p>

          <div style="font-family:Inter, Arial, sans-serif; font-size:32px; line-height:1; letter-spacing:8px; font-weight:700; color:#1E3A5F;">
            ${otp}
          </div>

        </div>

        <p style="margin:0 0 10px; font-size:13px; line-height:1.6; color:#6B7280;">
          This code will expire in
          <strong style="color:#1F2937;">10 minutes</strong>.
        </p>

        <p style="margin:0 0 28px; font-size:13px; line-height:1.6; color:#6B7280;">
          For your security, never share this code with anyone.
          Pixel & Pen will never ask you for your verification code.
        </p>

        <!-- Security Note -->
        <div style="padding:14px 16px; background:#FFF7E6; border-left:3px solid #F59E0B; border-radius:4px;">

          <p style="margin:0; font-size:12px; line-height:1.6; color:#6B7280;">
            If you didn't request a password reset, you can safely ignore
            this email. Your password will remain unchanged.
          </p>

        </div>

      </div>

      <!-- Footer -->
      <div style="padding:22px 36px; background:#FAFAF8; border-top:1px solid #E5E7EB; text-align:center;">

        <p style="margin:0 0 6px; font-family:'Newsreader', Georgia, serif; font-size:14px; font-style:italic; color:#6B7280;">
          A pixel paints, a pen writes — together, they build worlds.
        </p>

        <p style="margin:12px 0 0; font-size:11px; line-height:1.5; color:#9CA3AF;">
          This is an automated message from Pixel & Pen.<br>
          Please do not reply to this email.
        </p>

      </div>

    </div>

  </div>

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

async function sendPasswordResetOtpEmail(email, otp) {
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
    subject: "Pixel & Pen Password Reset OTP Code",
    html: `
      <div style="margin:0; padding:40px 16px; background:#FAFAF8; font-family:Inter, Arial, Helvetica, sans-serif; color:#1F2937;">

  <div style="max-width:560px; margin:0 auto;">

    <!-- Email Card -->
    <div style="background:#FFFFFF; border:1px solid #E5E7EB; border-radius:16px; overflow:hidden;">

      <!-- Header -->
      <div style="padding:30px 36px; border-bottom:1px solid #E5E7EB; text-align:center;">

        <img
          src="https://raw.githubusercontent.com/Roshan-Singh001/PixelandPen/main/frontend/src/assets/images/Pixel%20%26%20Pen(Main-New).png"
          alt="Pixel & Pen"
          style="height:42px; width:auto; display:inline-block;"
        />

      </div>

      <!-- Content -->
      <div style="padding:40px 36px 36px;">

        <!-- Heading -->
        <div style="margin-bottom:26px;">

          <p style="margin:0 0 8px; font-size:11px; line-height:1.4; letter-spacing:2px; text-transform:uppercase; font-weight:600; color:#F59E0B;">
            Password reset
          </p>

          <h1 style="margin:0; font-family:'Newsreader', Georgia, serif; font-size:34px; line-height:1.15; font-weight:500; letter-spacing:-0.5px; color:#1E3A5F;">
            Verify your request.
          </h1>

        </div>

        <!-- Message -->
        <p style="margin:0 0 18px; font-size:15px; line-height:1.7; color:#1F2937;">
          Hello,
        </p>

        <p style="margin:0 0 28px; font-size:15px; line-height:1.7; color:#6B7280;">
          We received a request to reset the password for your
          <strong style="color:#1F2937;">Pixel & Pen</strong> account.
          Enter the verification code below to continue.
        </p>

        <!-- OTP Box -->
        <div style="margin:30px 0; padding:28px 20px; background:#FAFAF8; border:1px solid #E5E7EB; border-radius:12px; text-align:center;">

          <p style="margin:0 0 14px; font-size:10px; line-height:1.4; letter-spacing:2px; text-transform:uppercase; font-weight:600; color:#6B7280;">
            Your verification code
          </p>

          <div style="font-family:Inter, Arial, Helvetica, sans-serif; font-size:32px; line-height:1; letter-spacing:8px; font-weight:700; color:#1E3A5F;">
            ${otp}
          </div>

        </div>

        <!-- Expiry -->
        <p style="margin:0 0 8px; font-size:13px; line-height:1.6; color:#6B7280;">
          This code expires in
          <strong style="color:#1F2937;">10 minutes</strong>.
        </p>

        <p style="margin:0 0 28px; font-size:13px; line-height:1.6; color:#6B7280;">
          For your security, please don't share this code with anyone.
          Pixel & Pen will never ask you for your OTP.
        </p>

        <!-- Security Notice -->
        <div style="padding:14px 16px; background:#FFF7E6; border-left:3px solid #F59E0B; border-radius:4px;">

          <p style="margin:0; font-size:12px; line-height:1.6; color:#6B7280;">
            If you didn't request a password reset, you can safely ignore
            this email. Your password will not be changed.
          </p>

        </div>

      </div>

      <!-- Footer -->
      <div style="padding:22px 36px; background:#FAFAF8; border-top:1px solid #E5E7EB; text-align:center;">

        <p style="margin:0 0 8px; font-family:'Newsreader', Georgia, serif; font-size:14px; font-style:italic; color:#6B7280;">
          A pixel paints, a pen writes — together, they build worlds.
        </p>

        <p style="margin:0; font-size:11px; line-height:1.5; color:#9CA3AF;">
          This is an automated message from Pixel & Pen.<br>
          Please do not reply to this email.
        </p>

      </div>

    </div>

  </div>

</div>

    `
  }

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

app.post("/auth/forgot-password", passwordResetLimiter, async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  try {
    if (!email) {
      return res.status(400).json({
        message: "Please enter your email address.",
      });
    }

    const queryCheckUser = `
      SELECT id
      FROM users
      WHERE email = ?
    `;

    const [userResult] = await db.execute(queryCheckUser, [email]);
    if (userResult.length === 0) {
      return res.status(200).json({
        message:
          "If an account exists with this email, we've sent a verification code.",
      });
    }

    const userId = userResult[0].id;
    await db.execute(
      `
        UPDATE password_reset_otps
        SET used_at = NOW()
        WHERE user_id = ?
          AND used_at IS NULL
      `,
      [userId]
    );

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    const otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );
    const hashedOtp = await bcrypt.hash(otp, 10);
    const queryInsertOtp = `
      INSERT INTO password_reset_otps
        (user_id, otp_hash, expires_at, attempts)
      VALUES (?, ?, ?, 0)
    `;
    await db.execute(queryInsertOtp, [
      userId,
      hashedOtp,
      otpExpiry,
    ]);

    await sendPasswordResetOtpEmail(email, otp);
    return res.status(200).json({
      message:
        "If an account exists with this email, we've sent a verification code.",
    });

  } catch (error) {
    console.error(
      "Error in forgot-password:",
      error
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/auth/verify-reset-otp", passwordResetLimiter, async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const otp = req.body.otp?.trim();

  try {

    if (!email || !otp) {
      return res.status(400).json({
        message: "Invalid or expired OTP.",
      });
    }

    // Find user
    const queryCheckUser = `
      SELECT id
      FROM users
      WHERE email = ?
    `;

    const [userResult] = await db.execute(
      queryCheckUser,
      [email]
    );

    if (userResult.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired OTP.",
      });
    }

    const userId = userResult[0].id;

    // Get latest unused OTP
    const queryGetOtp = `
      SELECT *
      FROM password_reset_otps
      WHERE user_id = ?
        AND used_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const [otpResult] = await db.execute(
      queryGetOtp,
      [userId]
    );

    if (otpResult.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired OTP.",
      });
    }

    const otpRecord = otpResult[0];

    // Maximum attempts
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({
        message: "Invalid or expired OTP.",
      });
    }

    // Check expiry
    if (new Date() > new Date(otpRecord.expires_at)) {

      await db.execute(
        `
          UPDATE password_reset_otps
          SET used_at = NOW()
          WHERE id = ?
        `,
        [otpRecord.id]
      );

      return res.status(400).json({
        message: "Invalid or expired OTP.",
      });
    }

    // Compare OTP
    const isOtpValid = await bcrypt.compare(
      otp,
      otpRecord.otp_hash
    );

    // Invalid OTP
    if (!isOtpValid) {

      await db.execute(
        `
          UPDATE password_reset_otps
          SET attempts = attempts + 1
          WHERE id = ?
        `,
        [otpRecord.id]
      );

      return res.status(400).json({
        message: "Invalid or expired OTP.",
      });
    }


    // Generate temporary reset token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    const resetTokenHash = await bcrypt.hash(
      resetToken,
      10
    );

    const resetTokenExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Mark OTP as used and store reset token
    await db.execute(
      `
        UPDATE password_reset_otps
        SET
          reset_token_hash = ?,
          reset_token_expires_at = ?
        WHERE id = ?
      `,
      [
        resetTokenHash,
        resetTokenExpiry,
        otpRecord.id,
      ]
    );

    return res.status(200).json({
      message: "OTP verified successfully.",
      resetToken,
    });

  } catch (error) {

    console.error(
      "Error in verify-reset-otp:",
      error
    );

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});

app.post("/auth/reset-password", passwordResetLimiter, async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { resetToken, newPassword } = req.body;

  console.log("Received reset password request:", {
    email,
    resetToken,
    newPassword,
  });

  try {
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        message: "Email, reset token, and new password are required.",
      });
    }

    if (newPassword.length < 4 || newPassword.length > 16) {
      return res.status(400).json({
        message: "Password must be between 4 and 16 characters.",
      });
    }

    // Find user
    const queryCheckUser = `
      SELECT id, role
      FROM users
      WHERE email = ?
    `;

    const [userResult] = await db.execute(
      queryCheckUser,
      [email]
    );

    if (userResult.length === 0) {
      return res.status(400).json({
        message: "Invalid reset token or email.",
      });
    }

    const user = userResult[0];

    if (user.role === "Admin") {
      return res.status(400).json({
        message: "Password reset for Admins is not allowed.",
      });
    }

    const userId = user.id;

    // Get latest reset token
    const resetTokenQuery = `
      SELECT *
      FROM password_reset_otps
      WHERE user_id = ?
        AND used_at IS NULL
        AND reset_token_hash IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const [otpResult] = await db.execute(
      resetTokenQuery,
      [userId]
    );

    if (otpResult.length === 0) {
      return res.status(400).json({
        message: "Invalid reset token or email.",
      });
    }

    const otpRecord = otpResult[0];

    // Check reset token expiry
    if (
      !otpRecord.reset_token_expires_at ||
      new Date() > new Date(otpRecord.reset_token_expires_at)
    ) {
      return res.status(400).json({
        message: "Reset token has expired.",
      });
    }

    // Verify reset token
    const isResetTokenValid = await bcrypt.compare(
      resetToken,
      otpRecord.reset_token_hash
    );

    if (!isResetTokenValid) {
      return res.status(400).json({
        message: "Invalid reset token or email.",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await db.execute(
      `
        UPDATE users
        SET password = ?
        WHERE id = ?
      `,
      [hashedNewPassword, userId]
    );

    if (user.role === "Contributor") {

      await db.execute(
        `
          UPDATE contributor
          SET password = ?
          WHERE cont_id = ?
        `,
        [hashedNewPassword, userId]
      );

    } else if (user.role === "Reader") {

      await db.execute(
        `
          UPDATE reader
          SET password = ?
          WHERE reader_id = ?
        `,
        [hashedNewPassword, userId]
      );
    }

    await db.execute(
      `
        UPDATE password_reset_otps
        SET used_at = NOW()
        WHERE id = ?
      `,
      [otpRecord.id]
    );

    return res.status(200).json({
      message: "Password reset successfully.",
    });

  } catch (error) {

    console.error(
      "Error in reset-password:",
      error
    );

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});
