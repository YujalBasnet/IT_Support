import express from "express";
import {
  addTeamMember,
  createTeam,
  getTeamById,
  getTeamMembers,
  getTeams,
  removeTeamMember,
  updateTeam,
} from "../controllers/teamController.js";
import { isLoggedIn, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Retrieve all support teams
 *     tags: [Support Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of support teams.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teams:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SupportTeam'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Admin access required.
 */
router.get("/", isLoggedIn, isAdmin, getTeams);

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new support team
 *     tags: [Support Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "DevOps & Cloud Support"
 *               description:
 *                 type: string
 *                 example: "AWS, Kubernetes, and CI/CD pipeline issues"
 *     responses:
 *       201:
 *         description: Team created successfully.
 *       400:
 *         description: Missing team name.
 *       403:
 *         description: Forbidden - Admin access required.
 *       409:
 *         description: Team name already exists.
 */
router.post("/", isLoggedIn, isAdmin, createTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get support team by ID
 *     tags: [Support Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Team details.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Team not found.
 */
router.get("/:id", isLoggedIn, isAdmin, getTeamById);

/**
 * @swagger
 * /api/teams/{id}:
 *   patch:
 *     summary: Update support team information
 *     tags: [Support Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team updated successfully.
 *       400:
 *         description: Team name is required.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Team not found.
 */
router.patch("/:id", isLoggedIn, isAdmin, updateTeam);

/**
 * @swagger
 * /api/teams/{id}/members:
 *   post:
 *     summary: Add an agent to a support team
 *     tags: [Support Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Member added successfully.
 *       400:
 *         description: Invalid user ID or user is not an active support agent.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Team or user not found.
 *       409:
 *         description: User already belongs to this team.
 */
router.post("/:id/members", isLoggedIn, isAdmin, addTeamMember);

/**
 * @swagger
 * /api/teams/{id}/members:
 *   get:
 *     summary: List all members belonging to a support team
 *     tags: [Support Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of team members.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Team not found.
 */
router.get("/:id/members", isLoggedIn, isAdmin, getTeamMembers);

/**
 * @swagger
 * /api/teams/{id}/members/{userId}:
 *   delete:
 *     summary: Remove an agent from a support team
 *     tags: [Support Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Team member removed successfully.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Team or member record not found.
 */
router.delete("/:id/members/:userId", isLoggedIn, isAdmin, removeTeamMember);

export default router;