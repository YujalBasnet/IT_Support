import express from "express";

import { addTeamMember, createTeam, getTeamById, getTeamMembers, getTeams, removeTeamMember, updateTeam } from "../controllers/teamController.js";

import { isLoggedIn, isAdmin, } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get( "/", isLoggedIn, isAdmin, getTeams );
router.post( "/", isLoggedIn, isAdmin, createTeam );
router.get( "/:id", isLoggedIn, isAdmin, getTeamById );
router.post("/:id/members", isLoggedIn, isAdmin, addTeamMember);
router.get("/:id/members", isLoggedIn, isAdmin, getTeamMembers);
router.delete("/:id/members/:userId", isLoggedIn, isAdmin, removeTeamMember);
router.patch("/:id", isLoggedIn, isAdmin, updateTeam);

export default router;