import express from "express";

import { createTicket, getTickets } from "../controllers/ticketController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isLoggedIn, createTicket);
router.get("/", isLoggedIn, getTickets);

export default router;