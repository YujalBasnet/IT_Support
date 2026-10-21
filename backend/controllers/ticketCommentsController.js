
import database from "../database/database.js";
import { sendEmail } from "../services/emailService.js";

// Add a comment to a ticket

export const addTicketComment = (req, res) => {
  const ticketId = Number(req.params.id);
  const userId = Number(req.user.userId);
  const roleId = Number(req.user.roleId);
  const { comment, is_internal = false } = req.body;

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return res.status(400).json({
      message: "Invalid ticket ID",
    });
  }

  if (typeof comment !== "string" || !comment.trim()) {
    return res.status(400).json({
      message: "Comment is required",
    });
  }

  if (![1, 2, 3].includes(roleId)) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  // Accept only explicit boolean or 0/1 representations.
  let internalFlag;

  if (
    is_internal === true ||
    is_internal === 1 ||
    is_internal === "1"
  ) {
    internalFlag = true;
  } else if (
    is_internal === false ||
    is_internal === 0 ||
    is_internal === "0"
  ) {
    internalFlag = false;
  } else {
    return res.status(400).json({
      message: "is_internal must be a boolean or 0/1",
    });
  }

  if (roleId === 1 && internalFlag) {
    return res.status(403).json({
      message: "Employees cannot create internal comments",
    });
  }

  const ticketQuery = `
    SELECT id, ticket_number, title, requester_id, assigned_agent_id, team_id
    FROM tickets
    WHERE id = ?
  `;

  database.query(ticketQuery, [ticketId], async (ticketError, tickets) => {
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

    if (roleId === 1 && Number(ticket.requester_id) !== userId) {
      return res.status(403).json({
        message: "You cannot comment on this ticket",
      });
    }

    if (roleId === 2 && Number(ticket.assigned_agent_id) !== userId) {
      let isTeamMember = false;
      if (ticket.team_id) {
        try {
          const [members] = await database.promise().query(
            "SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?",
            [ticket.team_id, userId]
          );
          isTeamMember = members.length > 0;
        } catch (mErr) {
          console.error("Error checking team membership:", mErr);
        }
      }

      if (!isTeamMember) {
        return res.status(403).json({
          message: "This ticket is not assigned to you or your team",
        });
      }
    }

    const insertQuery = `
      INSERT INTO comments
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

        // Never send internal comment content in an email.
        // Internal comments are not emailed to any recipient.
        if (internalFlag) {
          return res.status(201).json({
            message: "Internal comment added successfully",
            commentId: result.insertId,
            ticketId,
            userId,
            is_internal: true,
          });
        }

        // Notify the other party about the public comment.
        const recipientId =
          roleId === 1
            ? ticket.assigned_agent_id
            : ticket.requester_id;

        if (!recipientId || Number(recipientId) === userId) {
          return res.status(201).json({
            message: "Comment added successfully",
            commentId: result.insertId,
            ticketId,
            userId,
            is_internal: false,
          });
        }

        database.query(
          "SELECT email, name FROM users WHERE id = ?",
          [recipientId],
          (recipientError, recipients) => {
            if (recipientError) {
              console.error(
                "Failed to retrieve comment notification recipient:",
                recipientError
              );
            } else if (
              recipients.length > 0 &&
              recipients[0].email
            ) {
              const recipient = recipients[0];

              sendEmail({
                to: recipient.email,
                subject: `New Comment: ${ticket.ticket_number}`,
                text: `
Hello ${recipient.name || "User"},

A new public comment has been added to a support ticket.

Ticket Number: ${ticket.ticket_number}
Title: ${ticket.title}

Please log in to the IT Support System to view the comment.

Regards,
IT Support Team
                `.trim(),
              }).catch((emailError) => {
                console.error(
                  "Comment notification email failed:",
                  emailError.message
                );
              });
            }

            return res.status(201).json({
              message: "Comment added successfully",
              commentId: result.insertId,
              ticketId,
              userId,
              is_internal: false,
            });
          }
        );
      }
    );
  });
};


// Get comments for a ticket

export const getTicketComments = (req, res) => {
  const ticketId = Number(req.params.id);
  const userId = Number(req.user.userId);
  const roleId = Number(req.user.roleId);

  // Validate ticket ID
  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return res.status(400).json({
      message: "Invalid ticket ID",
    });
  }

  // Validate role
  if (![1, 2, 3].includes(roleId)) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  const ticketQuery = `
    SELECT id, requester_id, assigned_agent_id, team_id
    FROM tickets
    WHERE id = ?
  `;

  database.query(ticketQuery, [ticketId], async (ticketError, tickets) => {
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

    // Employees can only view their own tickets
    if (
      roleId === 1 &&
      Number(ticket.requester_id) !== userId
    ) {
      return res.status(403).json({
        message: "You cannot view comments on this ticket",
      });
    }

    // Support agents can view tickets assigned to them or their team
    if (roleId === 2 && Number(ticket.assigned_agent_id) !== userId) {
      let isTeamMember = false;
      if (ticket.team_id) {
        try {
          const [members] = await database.promise().query(
            "SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?",
            [ticket.team_id, userId]
          );
          isTeamMember = members.length > 0;
        } catch (mErr) {
          console.error("Error checking team membership:", mErr);
        }
      }

      if (!isTeamMember) {
        return res.status(403).json({
          message: "This ticket is not assigned to you or your team",
        });
      }
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
      FROM comments c
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
          ticketId,
          comments,
        });
      }
    );
  });
};


