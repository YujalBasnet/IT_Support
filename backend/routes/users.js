import express from "express";

import { getUserById, getUsers, updateUserRole, updateUserStatus } from "../controllers/userController.js";

import {isLoggedIn, isAdmin, } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", isLoggedIn, isAdmin, getUsers );
router.get("/:id", isLoggedIn, isAdmin, getUserById);
router.patch("/:id/role", isLoggedIn, isAdmin, updateUserRole);
router.patch("/:id/status", isLoggedIn, isAdmin, updateUserStatus);

export default router;