
import express from "express";
import upload from "../middleware/multerconfig.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";
import { canAccessTicket } from "../middleware/attachmentAccess.js";
import {
  deleteAttachment,
  downloadAttachment,
  getTicketAttachments,
  uploadAttachment,
} from "../controllers/attachmentController.js";
import { validateAttachment } from "../middleware/validateAttachment.js";

const router = express.Router();

// Upload an attachment to a ticket
router.post(
  "/tickets/:id/attachments",
  isLoggedIn,
  canAccessTicket,
  upload.single("file"),
  validateAttachment,
  uploadAttachment
);

// List attachments belonging to a ticket
router.get(
  "/tickets/:id/attachments",
  isLoggedIn,
  canAccessTicket,
  getTicketAttachments
);

// Download an attachment
router.get(
  "/:id/download",
  isLoggedIn,
  downloadAttachment
);

// Delete an attachment
router.delete(
  "/:id",
  isLoggedIn,
  deleteAttachment
);

export default router;
