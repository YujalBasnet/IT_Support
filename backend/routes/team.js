import express from "express";

import { createTeam, getTeams } from "../controllers/teamController.js";

import { isLoggedIn, isAdmin, } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get( "/", isLoggedIn, isAdmin, getTeams );
router.post( "/", isLoggedIn, isAdmin, createTeam );

export default router;