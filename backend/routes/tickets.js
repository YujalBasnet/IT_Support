import express from "express";

import { createTicket, getTickets, getTicketById, assignTicket, updateTicketStatus} from "../controllers/ticketController.js";
import { isAdmin, isLoggedIn } from "../middleware/authMiddleware.js";
import { addTicketComment, getTicketComments } from "../controllers/ticketCommentsController.js";

const router = express.Router();

router.post("/", isLoggedIn, createTicket);
router.get("/:id", isLoggedIn, getTicketById);
router.get("/", isLoggedIn, getTickets);
router.patch("/:id/assign", isLoggedIn, isAdmin, assignTicket);
router.patch("/:id/status", isLoggedIn, updateTicketStatus);
//ticket comments routes

router.post("/:id/comments", isLoggedIn, addTicketComment);
router.get("/:id/comments", isLoggedIn, getTicketComments);


export default router;