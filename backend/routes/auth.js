import express from "express";
import {
  googleLogin,
  googleCallback,
  getMe,
  logout,
  exchangeLoginCode,
  emailRegister,
  emailLogin,
} from "../controllers/authController.js";
import { adminTest } from "../controllers/testController.js";
import { isAdmin, isLoggedIn } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth 2.0 login
 *     tags: [Authentication]
 *     description: Redirects the client to Google's OAuth consent screen.
 *     responses:
 *       302:
 *         description: Redirect to Google Accounts authorization URL.
 */
router.get("/google", googleLogin);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth 2.0 callback endpoint
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code returned by Google.
 *     responses:
 *       302:
 *         description: Redirects to frontend callback with temporary login exchange code.
 *       400:
 *         description: Authorization code missing.
 *       500:
 *         description: Google authentication failed.
 */
router.get("/google/callback", googleCallback);

/**
 * @swagger
 * /api/auth/exchange:
 *   post:
 *     summary: Exchange login code for JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "a8f9c2d1-e5b4-4c3a-9e12-3456789abcde"
 *     responses:
 *       200:
 *         description: Token exchange successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Login code is required or expired.
 */
router.post("/exchange", exchangeLoginCode);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane@company.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass@123"
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Validation failed (missing fields, weak password, or invalid email).
 *       409:
 *         description: User with this email already exists.
 */
router.post("/register", emailRegister);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@itsupport.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password@123"
 *     responses:
 *       200:
 *         description: Authentication successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Email and password are required.
 *       401:
 *         description: Invalid credentials.
 *       403:
 *         description: Account is inactive.
 */
router.post("/login", emailLogin);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get currently authenticated user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Valid JWT Bearer token required.
 *       404:
 *         description: User not found.
 */
router.get("/me", isLoggedIn, getMe);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Sign out the authenticated session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful.
 *       401:
 *         description: Unauthorized.
 */
router.post("/logout", isLoggedIn, logout);

router.get("/admin-test", isLoggedIn, isAdmin, adminTest);

export default router;