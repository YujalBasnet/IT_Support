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

/**
 * @swagger
 * /api/attachments/tickets/{id}/attachments:
 *   post:
 *     summary: Upload file attachment to a ticket
 *     tags: [Attachments]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Allowed formats (PNG, JPG, JPEG, PDF, TXT, LOG). Max size 10MB.
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 attachment:
 *                   $ref: '#/components/schemas/Attachment'
 *       400:
 *         description: Invalid file type or file exceeds size limit.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access denied to ticket.
 *       404:
 *         description: Ticket not found.
 */
router.post(
  "/tickets/:id/attachments",
  isLoggedIn,
  canAccessTicket,
  upload.single("file"),
  validateAttachment,
  uploadAttachment
);

/**
 * @swagger
 * /api/attachments/tickets/{id}/attachments:
 *   get:
 *     summary: List all attachments for a ticket
 *     tags: [Attachments]
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
 *         description: List of attachments.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticketId:
 *                   type: integer
 *                 attachments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attachment'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: Ticket not found.
 */
router.get(
  "/tickets/:id/attachments",
  isLoggedIn,
  canAccessTicket,
  getTicketAttachments
);

/**
 * @swagger
 * /api/attachments/{id}/download:
 *   get:
 *     summary: Download an attachment file
 *     tags: [Attachments]
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
 *         description: Binary file stream for download.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: Attachment or file not found on disk.
 */
router.get(
  "/:id/download",
  isLoggedIn,
  downloadAttachment
);

/**
 * @swagger
 * /api/attachments/{id}:
 *   delete:
 *     summary: Delete an attachment
 *     tags: [Attachments]
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
 *         description: Attachment deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Only file uploader or admin can delete.
 *       404:
 *         description: Attachment not found.
 */
router.delete(
  "/:id",
  isLoggedIn,
  deleteAttachment
);

export default router;
