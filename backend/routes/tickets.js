import express from "express";

import { createTicket } from "../controllers/ticketController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isLoggedIn, createTicket);

export default router;