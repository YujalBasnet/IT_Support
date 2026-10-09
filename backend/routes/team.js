import express from "express";

import { addTeamMember, createTeam, getTeamById, getTeamMembers, getTeams } from "../controllers/teamController.js";

import { isLoggedIn, isAdmin, } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get( "/", isLoggedIn, isAdmin, getTeams );
router.post( "/", isLoggedIn, isAdmin, createTeam );
router.get( "/:id", isLoggedIn, isAdmin, getTeamById );
router.post("/:id/members", isLoggedIn, isAdmin, addTeamMember);
router.get("/:id/members", isLoggedIn, isAdmin, getTeamMembers);

export default router;