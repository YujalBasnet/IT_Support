
import database from "../database/database.js";

// Add a comment to a ticket
export const addTicketComment = (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.userId;
  const { comment, is_internal = false } = req.body;
  const roleId = Number(req.user.roleId);

  if (!comment || !comment.trim()) {
    return res.status(400).json({
      message: "Comment is required",
    });
  }

  if (![1, 2, 3].includes(roleId)) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  // Employees cannot create internal comments
  if (roleId === 1 && is_internal) {
    return res.status(403).json({
      message: "Employees cannot create internal comments",
    });
  }

  // Check whether the ticket exists and whether the user can access it
  let ticketQuery = `
    SELECT id, requester_id, assigned_agent_id
    FROM tickets
    WHERE id = ?
  `;

  database.query(ticketQuery, [ticketId], (ticketError, tickets) => {
    if (ticketError) {
      console.error("Error checking ticket:", ticketError);
      return res.status(500).json({
        message: "Failed to check ticket",
      });
    }

    if (tickets.length === 0) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const ticket = tickets[0];

    // Employees can comment only on their own tickets
    if (roleId === 1 && ticket.requester_id !== userId) {
      return res.status(403).json({
        message: "You cannot comment on this ticket",
      });
    }

    // Support agents can comment only on tickets assigned to them
    if (roleId === 2 && ticket.assigned_agent_id !== userId) {
      return res.status(403).json({
        message: "This ticket is not assigned to you",
      });
    }

    const internalFlag = is_internal === true ||
      is_internal === 1 ||
      is_internal === "1";

    const insertQuery = `
      INSERT INTO ticket_comments
        (ticket_id, user_id, comment, is_internal)
      VALUES (?, ?, ?, ?)
    `;

    database.query(
      insertQuery,
      [ticketId, userId, comment.trim(), internalFlag ? 1 : 0],
      (insertError, result) => {
        if (insertError) {
          console.error("Error adding comment:", insertError);
          return res.status(500).json({
            message: "Failed to add comment",
          });
        }

        return res.status(201).json({
          message: "Comment added successfully",
          commentId: result.insertId,
          ticketId: Number(ticketId),
          userId,
          is_internal: internalFlag,
        });
      }
    );
  });
};

// Get comments for a ticket
export const getTicketComments = (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.userId;
  const roleId = Number(req.user.roleId);

  const ticketQuery = `
    SELECT id, requester_id, assigned_agent_id
    FROM tickets
    WHERE id = ?
  `;

  database.query(ticketQuery, [ticketId], (ticketError, tickets) => {
    if (ticketError) {
      console.error("Error checking ticket:", ticketError);
      return res.status(500).json({
        message: "Failed to check ticket",
      });
    }

    if (tickets.length === 0) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const ticket = tickets[0];

    if (
      roleId === 1 &&
      ticket.requester_id !== userId
    ) {
      return res.status(403).json({
        message: "You cannot view comments on this ticket",
      });
    }

    if (
      roleId === 2 &&
      ticket.assigned_agent_id !== userId
    ) {
      return res.status(403).json({
        message: "This ticket is not assigned to you",
      });
    }

    let commentsQuery = `
      SELECT
        c.id,
        c.ticket_id,
        c.user_id,
        u.name AS user_name,
        c.comment,
        c.is_internal,
        c.created_at,
        c.updated_at
      FROM ticket_comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.ticket_id = ?
    `;

    // Employees must never see internal comments
    if (roleId === 1) {
      commentsQuery += " AND c.is_internal = 0";
    }

    commentsQuery += " ORDER BY c.created_at ASC";

    database.query(
      commentsQuery,
      [ticketId],
      (commentsError, comments) => {
        if (commentsError) {
          console.error("Error retrieving comments:", commentsError);
          return res.status(500).json({
            message: "Failed to retrieve comments",
          });
        }

        return res.status(200).json({
          ticketId: Number(ticketId),
          comments,
        });
      }
    );
  });
};

