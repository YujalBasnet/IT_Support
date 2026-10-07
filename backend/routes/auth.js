import express from "express";
import {
  googleLogin,
  googleCallback,
  getMe,
} from "../controllers/authController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/me", isLoggedIn, getMe);

export default router;