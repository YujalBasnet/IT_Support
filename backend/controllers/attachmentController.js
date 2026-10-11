
// controllers/attachmentController.js
import fs from "fs/promises";
import database from "../database/database.js";
import path from "path";

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




export const downloadAttachment = async (req, res) => {
  try {
    const attachmentId = Number(req.params.id);
    const userId = Number(req.user.userId);
    const roleId = Number(req.user.roleId);

    if (!Number.isInteger(attachmentId) || attachmentId <= 0) {
      return res.status(400).json({
        message: "Invalid attachment ID",
      });
    }

    const [rows] = await database.promise().query(
      `SELECT
         a.id,
         a.ticket_id,
         a.original_name,
         a.file_path,
         t.requester_id,
         t.assigned_agent_id
       FROM attachments a
       JOIN tickets t ON t.id = a.ticket_id
       WHERE a.id = ?`,
      [attachmentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    const attachment = rows[0];

    const allowed =
      roleId === 3 ||
      (roleId === 1 &&
        Number(attachment.requester_id) === userId) ||
      (roleId === 2 &&
        Number(attachment.assigned_agent_id) === userId);

    if (!allowed) {
      return res.status(403).json({
        message: "You cannot download this attachment",
      });
    }

    const allowedRoot = path.resolve("uploads", "tickets");
    const absolutePath = path.resolve(attachment.file_path);

    if (!absolutePath.startsWith(allowedRoot + path.sep)) {
      return res.status(404).json({
        message: "Attachment file not found",
      });
    }

    try {
      await fs.access(absolutePath);
    } catch {
      return res.status(404).json({
        message: "Attachment file not found",
      });
    }

    return res.download(
      absolutePath,
      attachment.original_name,
      (error) => {
        if (error) {
          console.error("File download error:", error);

          if (!res.headersSent) {
            res.status(500).json({
              message: "Failed to download attachment",
            });
          }
        }
      }
    );
  } catch (error) {
    console.error("Download attachment error:", error);

    return res.status(500).json({
      message: "Failed to download attachment",
    });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const attachmentId = Number(req.params.id);
    const userId = Number(req.user.userId);
    const roleId = Number(req.user.roleId);

    if (!Number.isInteger(attachmentId) || attachmentId <= 0) {
      return res.status(400).json({
        message: "Invalid attachment ID",
      });
    }

    const [rows] = await database.promise().query(
      `SELECT
         a.id,
         a.uploaded_by,
         a.file_path,
         t.requester_id,
         t.assigned_agent_id
       FROM attachments a
       JOIN tickets t ON t.id = a.ticket_id
       WHERE a.id = ?`,
      [attachmentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    const attachment = rows[0];

    const canDelete =
      roleId === 3 ||
      (
        Number(attachment.uploaded_by) === userId &&
        (
          (roleId === 1 &&
            Number(attachment.requester_id) === userId) ||
          (roleId === 2 &&
            Number(attachment.assigned_agent_id) === userId)
        )
      );

    if (!canDelete) {
      return res.status(403).json({
        message: "You cannot delete this attachment",
      });
    }

    // Prevent deletion of files outside our upload directory.
    const allowedRoot = path.resolve("uploads", "tickets");
    const absolutePath = path.resolve(attachment.file_path);

    if (!absolutePath.startsWith(allowedRoot + path.sep)) {
      return res.status(400).json({
        message: "Invalid attachment file path",
      });
    }

    // Remove the physical file first.
    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    // Remove its database record.
    await database.promise().query(
      "DELETE FROM attachments WHERE id = ?",
      [attachmentId]
    );

    return res.status(200).json({
      message: "Attachment deleted successfully",
    });
  } catch (error) {
    console.error("Delete attachment error:", error);

    return res.status(500).json({
      message: "Failed to delete attachment",
    });
  }
};