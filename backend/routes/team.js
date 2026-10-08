import express from "express";

import { getTeams } from "../controllers/teamController.js";

import { isLoggedIn, isAdmin, } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get( "/", isLoggedIn, isAdmin, getTeams );

export default router;