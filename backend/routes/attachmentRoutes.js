
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

// Upload attachment
router.post(
  "/tickets/:id/attachments",
  isLoggedIn,
  canAccessTicket,
  upload.single("file"),
  validateAttachment,
  uploadAttachment
);

// List ticket attachments
router.get(
  "/tickets/:id/attachments",
  isLoggedIn,
  canAccessTicket,
  getTicketAttachments
);

// Download attachment
router.get(
  "/attachments/:id/download",
  isLoggedIn,
  downloadAttachment
);

// Delete attachment
router.delete(
  "/attachments/:id",
  isLoggedIn,
  deleteAttachment
);

export default router;
