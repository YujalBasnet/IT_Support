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

router.post("/", isLoggedIn, createTicket);

// Ticket statistics — MUST be before /:id
router.get("/stats", isLoggedIn, isAdmin, getTicketStats);

// Ticket list
router.get("/", isLoggedIn, getTickets);

// Ticket assignment and status
router.patch("/:id/assign", isLoggedIn, isAdmin, assignTicket);
router.patch("/:id/status", isLoggedIn, updateTicketStatus);

// Update ticket info / priority (Admins & Support Agents)
router.patch("/:id", isLoggedIn, updateTicket);

// Ticket comments
router.post("/:id/comments", isLoggedIn, addTicketComment);
router.get("/:id/comments", isLoggedIn, getTicketComments);

// Ticket history
router.get("/:id/history", isLoggedIn, getTicketHistory);

// Single ticket — keep after specific routes
router.get("/:id", isLoggedIn, getTicketById);

export default router;
