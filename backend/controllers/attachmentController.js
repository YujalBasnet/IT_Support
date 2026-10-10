
// controllers/attachmentController.js
import path from "path";
import fs from "fs/promises";
import database from "../config/database.js";

// Upload attachment
export const uploadAttachment = async (req, res) => {
  let connection;

  try {
    const { id: ticketId } = req.params;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a file to upload.",
      });
    }

    // Check that the ticket exists
    const [tickets] = await database.query(
      "SELECT id FROM tickets WHERE id = ?",
      [ticketId]
    );

    if (tickets.length === 0) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({
        message: "Ticket not found.",
      });
    }

    // TODO: Add your ticket-access authorization check here
    // before allowing the user to upload.

    const {
      originalname,
      filename,
      mimetype,
      size,
      path: filePath,
    } = req.file;

    const [result] = await database.query(
      `INSERT INTO attachments
       (ticket_id, uploaded_by, original_name, stored_name,
        file_path, file_type, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ticketId,
        userId,
        originalname,
        filename,
        filePath,
        mimetype,
        size,
      ]
    );

    return res.status(201).json({
      message: "Attachment uploaded successfully.",
      attachment: {
        id: result.insertId,
        ticket_id: Number(ticketId),
        uploaded_by: userId,
        original_name: originalname,
        stored_name: filename,
        file_type: mimetype,
        file_size: size,
      },
    });
  } catch (error) {
    // If the database insert fails, remove the uploaded file.
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    console.error("Attachment upload error:", error);

    return res.status(500).json({
      message: "Failed to upload attachment.",
    });
  }
};
