import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import database from "../database/database.js";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

export const googleLogin = (req, res) => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
  });

  res.redirect(authUrl);
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        message: "Authorization code missing",
      });
    }

    // Get Google tokens
    const { tokens } = await googleClient.getToken(code);

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const name = payload.name;
    const email = payload.email;
    const profileImage = payload.picture;

    // Check if user already exists
    const [existingUsers] = await database
      .promise()
      .query(
        "SELECT id, name, email, profile_image, role_id, account_status FROM users WHERE email = ?",
        [email]
      );

    let user;

    if (existingUsers.length > 0) {
      // Existing user
      user = existingUsers[0];

      // Check account status
      if (user.account_status !== "ACTIVE") {
        return res.status(403).json({
          message: "Your account is inactive",
        });
      }

    } else {
      // Find EMPLOYEE role
      const [roles] = await database
        .promise()
        .query(
          "SELECT id FROM roles WHERE name = 'EMPLOYEE'"
        );

      if (roles.length === 0) {
        return res.status(500).json({
          message: "EMPLOYEE role not found",
        });
      }

      const employeeRoleId = roles[0].id;

      // Create new user
      const [result] = await database
        .promise()
        .query(
          `INSERT INTO users
          (name, email, profile_image, role_id, account_status)
          VALUES (?, ?, ?, ?, 'ACTIVE')`,
          [name, email, profileImage, employeeRoleId]
        );

      user = {
        id: result.insertId,
        name,
        email,
        profile_image: profileImage,
        role_id: employeeRoleId,
        account_status: "ACTIVE",
      };
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roleId: user.role_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_image: user.profile_image,
        role_id: user.role_id,
      },
    });

  } catch (error) {
    console.error("Google authentication error:", error);

    res.status(500).json({
      message: "Google authentication failed",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const [users] = await database
      .promise()
      .query(
        `SELECT 
          u.id,
          u.name,
          u.email,
          u.profile_image,
          u.account_status,
          r.name AS role
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?`,
        [req.user.userId]
      );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User information retrieved successfully",
      user: users[0],
    });

  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      message: "Failed to get user information",
    });
  }
};