import express from "express";
import {googleLogin, googleCallback, getMe, logout, exchangeLoginCode } from "../controllers/authController.js";
import { adminTest } from "../controllers/testController.js";
import { isAdmin, isLoggedIn } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/me", isLoggedIn, getMe);
router.post("/logout", isLoggedIn, logout);
router.get("/admin-test", isLoggedIn,isAdmin, adminTest);
router.post("/exchange", exchangeLoginCode);

export default router;