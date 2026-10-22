import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  assignTicket,
  updateTicketStatus,
  updateTicket,
  getTicketHistory,
  getTicketStats,
} from "../controllers/ticketController.js";
import { isAdmin, isLoggedIn } from "../middleware/authMiddleware.js";
import { addTicketComment, getTicketComments } from "../controllers/ticketCommentsController.js";

const router = express.Router();

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new support ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category_id
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Network connection drops every afternoon"
 *               description:
 *                 type: string
 *                 example: "Wi-Fi in Conference Room B disconnects frequently."
 *               category_id:
 *                 type: integer
 *                 example: 3
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 default: MEDIUM
 *     responses:
 *       201:
 *         description: Ticket created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Validation error (missing fields, invalid category, invalid priority).
 *       401:
 *         description: Unauthorized.
 */
router.post("/", isLoggedIn, createTicket);

/**
 * @swagger
 * /api/tickets/stats:
 *   get:
 *     summary: Get overall ticket counts and metrics
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 45
 *                 open:
 *                   type: integer
 *                   example: 12
 *                 inProgress:
 *                   type: integer
 *                   example: 18
 *                 resolved:
 *                   type: integer
 *                   example: 15
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Admin access required.
 */
router.get("/stats", isLoggedIn, isAdmin, getTicketStats);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Search, filter, and paginate tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword across ticket number, title, and description (e.g. laptop).
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, ASSIGNED, IN_PROGRESS, WAITING_FOR_USER, RESOLVED, CLOSED, REOPENED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: assigned_agent_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: team_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, priority, status]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Paginated list of tickets.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized.
 */
router.get("/", isLoggedIn, getTickets);

/**
 * @swagger
 * /api/tickets/{id}/assign:
 *   patch:
 *     summary: Assign or reassign ticket to support agent and team
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assigned_agent_id
 *               - team_id
 *             properties:
 *               assigned_agent_id:
 *                 type: integer
 *                 example: 2
 *               team_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Ticket assigned successfully.
 *       400:
 *         description: Validation error or agent does not belong to team.
 *       403:
 *         description: Forbidden - Admin permission required.
 *       404:
 *         description: Ticket or team not found.
 */
router.patch("/:id/assign", isLoggedIn, isAdmin, assignTicket);

/**
 * @swagger
 * /api/tickets/{id}/status:
 *   patch:
 *     summary: Transition ticket status workflow
 *     tags: [Tickets]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [OPEN, ASSIGNED, IN_PROGRESS, WAITING_FOR_USER, RESOLVED, CLOSED, REOPENED]
 *                 example: "IN_PROGRESS"
 *     responses:
 *       200:
 *         description: Status updated successfully.
 *       400:
 *         description: Disallowed status transition according to lifecycle rules.
 *       403:
 *         description: Forbidden (e.g. employee attempting to set status to RESOLVED).
 *       404:
 *         description: Ticket not found.
 */
router.patch("/:id/status", isLoggedIn, updateTicketStatus);

/**
 * @swagger
 * /api/tickets/{id}:
 *   patch:
 *     summary: Update ticket priority or metadata
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               category_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket updated successfully.
 *       400:
 *         description: Invalid parameters.
 *       403:
 *         description: Unauthorized to modify these fields.
 *       404:
 *         description: Ticket not found.
 */
router.patch("/:id", isLoggedIn, updateTicket);

/**
 * @swagger
 * /api/tickets/{id}/comments:
 *   post:
 *     summary: Add comment or internal support note to ticket
 *     tags: [Comments]
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
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Technician dispatched to replace the HDMI cable."
 *               is_internal:
 *                 type: boolean
 *                 default: false
 *                 description: If true, visible ONLY to agents & admins (never to employees).
 *     responses:
 *       201:
 *         description: Comment added successfully.
 *       400:
 *         description: Missing comment body.
 *       403:
 *         description: Access denied or employee attempting internal comment.
 *       404:
 *         description: Ticket not found.
 */
router.post("/:id/comments", isLoggedIn, addTicketComment);

/**
 * @swagger
 * /api/tickets/{id}/comments:
 *   get:
 *     summary: Retrieve ticket comments
 *     tags: [Comments]
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
 *         description: Comments thread retrieved. Internal comments filtered for employees.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticketId:
 *                   type: integer
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: Ticket not found.
 */
router.get("/:id/comments", isLoggedIn, getTicketComments);

/**
 * @swagger
 * /api/tickets/{id}/history:
 *   get:
 *     summary: Retrieve ticket lifecycle audit timeline
 *     tags: [Tickets]
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
 *         description: Ticket activity history timeline.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: Ticket not found.
 */
router.get("/:id/history", isLoggedIn, getTicketHistory);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get single ticket details by ID
 *     tags: [Tickets]
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
 *         description: Ticket details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: Ticket not found.
 */
router.get("/:id", isLoggedIn, getTicketById);

export default router;
