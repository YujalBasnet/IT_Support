import express from "express";

import { createTicket, getTickets, getTicketById, assignTicket} from "../controllers/ticketController.js";
import { isAdmin, isLoggedIn } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isLoggedIn, createTicket);
router.get("/:id", isLoggedIn, getTicketById);
router.get("/", isLoggedIn, getTickets);
router.patch("/:id/assign", isLoggedIn, isAdmin, assignTicket);

export default router;