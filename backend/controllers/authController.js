import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import database from "../database/database.js";
import {
  createLoginCode,
  consumeLoginCode,
} from "../services/oauthCodeStore.js";

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

    
const loginCode = createLoginCode({
  token,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    profile_image: user.profile_image,
    role_id: user.role_id,
  },
});

return res.redirect(
  `http://localhost:5173/auth/callback?code=${loginCode}`
);


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
          u.role_id,
          u.created_at,
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

    const user = users[0];
    let stats = {
      totalTickets: 0,
      openTickets: 0,
      inProgressTickets: 0,
      resolvedTickets: 0,
      closedTickets: 0,
    };

    if (user.role_id === 1) {
      const [ticketCounts] = await database.promise().query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status IN ('OPEN', 'ASSIGNED', 'REOPENED', 'WAITING_FOR_USER') THEN 1 ELSE 0 END) as openCount,
          SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount,
          SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolvedCount,
          SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) as closedCount
        FROM tickets 
        WHERE requester_id = ?`,
        [user.id]
      );
      if (ticketCounts.length > 0) {
        stats = {
          totalTickets: Number(ticketCounts[0].total) || 0,
          openTickets: Number(ticketCounts[0].openCount) || 0,
          inProgressTickets: Number(ticketCounts[0].inProgressCount) || 0,
          resolvedTickets: Number(ticketCounts[0].resolvedCount) || 0,
          closedTickets: Number(ticketCounts[0].closedCount) || 0,
        };
      }
    } else if (user.role_id === 2) {
      const [ticketCounts] = await database.promise().query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status IN ('OPEN', 'ASSIGNED', 'REOPENED') THEN 1 ELSE 0 END) as assignedCount,
          SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount,
          SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolvedCount
        FROM tickets 
        WHERE assigned_agent_id = ?`,
        [user.id]
      );
      const [teams] = await database.promise().query(
        `SELECT st.id, st.name 
         FROM support_teams st
         JOIN team_members tm ON st.id = tm.team_id
         WHERE tm.user_id = ?`,
        [user.id]
      );
      stats = {
        totalTickets: Number(ticketCounts[0]?.total) || 0,
        assignedTickets: Number(ticketCounts[0]?.assignedCount) || 0,
        inProgressTickets: Number(ticketCounts[0]?.inProgressCount) || 0,
        resolvedTickets: Number(ticketCounts[0]?.resolvedCount) || 0,
        teams: teams || [],
      };
    }

    res.json({
      message: "User information retrieved successfully",
      user,
      stats,
    });

  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      message: "Failed to get user information",
    });
  }
};

export const logout = (req, res) => {
  res.json({
    message: "Logout successful",
  });
};


export const exchangeLoginCode = (req, res) => {
  const { code } = req.body ?? {};

  if (typeof code !== "string" || !code) {
    return res.status(400).json({
      message: "Login code is required",
    });
  }

  const loginData = consumeLoginCode(code);

  if (!loginData) {
    return res.status(400).json({
      message: "Login code is invalid or expired",
    });
  }

  return res.status(200).json({
    message: "Login successful",
    ...loginData,
  });
};

// ─── Email / Password Register ───────────────────────────────────────────────
export const emailRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if email already exists
    const [existing] = await database
      .promise()
      .query("SELECT id FROM users WHERE email = ?", [email]);

    if (existing.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    // Get EMPLOYEE role
    const [roles] = await database
      .promise()
      .query("SELECT id FROM roles WHERE name = 'EMPLOYEE'");

    if (roles.length === 0) {
      return res.status(500).json({ message: "EMPLOYEE role not found" });
    }

    const employeeRoleId = roles[0].id;
    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await database
      .promise()
      .query(
        `INSERT INTO users (name, email, password_hash, role_id, account_status)
         VALUES (?, ?, ?, ?, 'ACTIVE')`,
        [name.trim(), email.toLowerCase().trim(), password_hash, employeeRoleId]
      );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      profile_image: null,
      role_id: employeeRoleId,
    };

    const token = jwt.sign(
      { userId: user.id, email: user.email, roleId: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Email register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ─── Email / Password Login ───────────────────────────────────────────────────
export const emailLogin = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [users] = await database
      .promise()
      .query(
        "SELECT id, name, email, profile_image, role_id, account_status, password_hash FROM users WHERE email = ?",
        [email.toLowerCase().trim()]
      );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    if (user.account_status !== "ACTIVE") {
      return res.status(403).json({ message: "Your account is inactive. Contact your administrator." });
    }

    if (!user.password_hash) {
      return res.status(401).json({
        message: "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, roleId: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
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
    console.error("Email login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};
