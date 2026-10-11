import express from "express";
import upload from "../middleware/multerconfig.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";
import { canAccessTicket } from "../middleware/attachmentAccess.js";
import { deleteAttachment, downloadAttachment, getTicketAttachments, uploadAttachment, } from "../controllers/attachmentController.js";

const router = express.Router();

router.post( "/tickets/:id/attachments", isLoggedIn, canAccessTicket, upload.single("file"), uploadAttachment );

router.get( "/tickets/:id/attachments", isLoggedIn, canAccessTicket, getTicketAttachments );

router.get("/attachments/:id/download", isLoggedIn, downloadAttachment);
router.delete("/attachments/:id", isLoggedIn, deleteAttachment);
router.post( "/tickets/:id/attachments", isLoggedIn, canAccessTicket, upload.single("file"), uploadAttachment );

export default router;