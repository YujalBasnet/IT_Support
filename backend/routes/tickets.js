import express from "express";

import { createTicket, getTickets, getTicketById } from "../controllers/ticketController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isLoggedIn, createTicket);
router.get("/:id", isLoggedIn, getTicketById);
router.get("/", isLoggedIn, getTickets);

export default router;