import express from "express";

import { getUsers } from "../controllers/userController.js";

import {isLoggedIn, isAdmin, } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", isLoggedIn, isAdmin, getUsers );

export default router;