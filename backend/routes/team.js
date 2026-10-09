import express from "express";

import { createTeam, getTeamById, getTeams } from "../controllers/teamController.js";

import { isLoggedIn, isAdmin, } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get( "/", isLoggedIn, isAdmin, getTeams );
router.post( "/", isLoggedIn, isAdmin, createTeam );
router.get( "/:id", isLoggedIn, isAdmin, getTeamById );

export default router;