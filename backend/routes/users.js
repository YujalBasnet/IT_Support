import express from "express";

import { getUserById, getUsers } from "../controllers/userController.js";

import {isLoggedIn, isAdmin, } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", isLoggedIn, isAdmin, getUsers );
router.get("/:id", isLoggedIn, isAdmin, getUserById);

export default router;