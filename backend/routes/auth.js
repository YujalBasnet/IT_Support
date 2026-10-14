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

// Google OAuth
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.post("/exchange", exchangeLoginCode);

// Email / Password
router.post("/register", emailRegister);
router.post("/login", emailLogin);

// Protected
router.get("/me", isLoggedIn, getMe);
router.post("/logout", isLoggedIn, logout);
router.get("/admin-test", isLoggedIn, isAdmin, adminTest);

export default router;