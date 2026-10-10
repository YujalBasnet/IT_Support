
// controllers/attachmentController.js
import fs from "fs/promises";
import database from "../database/database.js";

export const uploadAttachment = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    const userId = req.user.userId;

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        message: "Invalid ticket ID.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a file to upload.",
      });
    }

    // Verify the ticket exists.
    const [tickets] = await database.promise().query(
      "SELECT id FROM tickets WHERE id = ?",
      [ticketId]
    );

    if (tickets.length === 0) {
      await fs.unlink(req.file.path).catch(() => {});

      return res.status(404).json({
        message: "Ticket not found.",
      });
    }

    // IMPORTANT:
    // Add your ticket-access authorization check here before
    // allowing employees or agents to upload attachments.

    const [result] = await database.promise().query(
      `INSERT INTO attachments
       (ticket_id, uploaded_by, original_name, stored_name,
        file_path, file_type, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ticketId,
        userId,
        req.file.originalname,
        req.file.filename,
        req.file.path,
        req.file.mimetype,
        req.file.size,
      ]
    );

    return res.status(201).json({
      message: "Attachment uploaded successfully.",
      attachment: {
        id: result.insertId,
        ticket_id: ticketId,
        uploaded_by: userId,
        original_name: req.file.originalname,
        stored_name: req.file.filename,
        file_type: req.file.mimetype,
        file_size: req.file.size,
      },
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    console.error("Upload attachment error:", error);

    return res.status(500).json({
      message: "Failed to upload attachment.",
    });
  }
};



export const getTicketAttachments = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);

    const [attachments] = await database.promise().query(
      `SELECT
         id,
         ticket_id,
         uploaded_by,
         original_name,
         stored_name,
         file_type,
         file_size,
         created_at
       FROM attachments
       WHERE ticket_id = ?
       ORDER BY created_at DESC, id DESC`,
      [ticketId]
    );

    return res.status(200).json({
      count: attachments.length,
      attachments,
    });
  } catch (error) {
    console.error("Get attachments error:", error);

    return res.status(500).json({
      message: "Failed to retrieve attachments.",
    });
  }
};
