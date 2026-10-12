import database from "../database/database.js";
import { sendEmail } from "../services/emailService.js";

export const createTicket = (req, res) => {
  const { title, description, category_id, priority = "MEDIUM" } = req.body;

  // Validate title and description
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof description !== "string" ||
    !description.trim()
  ) {
    return res.status(400).json({
      message: "Title and description are required",
    });
  }

  if (title.trim().length > 255) {
    return res.status(400).json({
      message: "Title must not exceed 255 characters",
    });
  }

  // Validate category ID
  const categoryId = Number(category_id);

  if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
    return res.status(400).json({
      message: "Valid category ID is required",
    });
  }

  // Validate priority
  const allowedPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

  if (!allowedPriorities.includes(priority)) {
    return res.status(400).json({
      message: "Invalid ticket priority",
    });
  }

  // Check that the category exists and is active
  const categoryQuery = `
    SELECT id, is_active
    FROM categories
    WHERE id = ?
  `;

  database.query(categoryQuery, [categoryId], (categoryError, categories) => {
    if (categoryError) {
      console.error("Error checking category:", categoryError);

      return res.status(500).json({
        message: "Failed to validate category",
      });
    }

    if (categories.length === 0) {
      return res.status(400).json({
        message: "Selected category does not exist",
      });
    }

    if (Number(categories[0].is_active) !== 1) {
      return res.status(400).json({
        message: "Selected category is disabled",
      });
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}`;

    const insertQuery = `
        INSERT INTO tickets
          (ticket_number, title, description,
           requester_id, category_id, priority)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

    const values = [
      ticketNumber,
      title.trim(),
      description.trim(),
      req.user.userId,
      categoryId,
      priority,
    ];

    database.query(insertQuery, values, (error, result) => {
      if (error) {
        console.error("Error creating ticket:", error);

        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            message: "Ticket number collision. Please retry.",
          });
        }

        return res.status(500).json({
          message: "Failed to create ticket",
        });
      }

      const ticketId = result.insertId;

      const historyQuery = `
          INSERT INTO ticket_history
            (ticket_id, user_id, action, previous_value, new_value)
          VALUES (?, ?, ?, ?, ?)
        `;

      const historyValues = [
        ticketId,
        Number(req.user.userId),
        "TICKET_CREATED",
        null,
        JSON.stringify({
          ticket_number: ticketNumber,
          title: title.trim(),
          status: "OPEN",
        }),
      ];

      database.query(historyQuery, historyValues, (historyError) => {
        if (historyError) {
          console.error(
            "Error recording ticket creation history:",
            historyError,
          );

          return res.status(500).json({
            message: "Ticket was created, but history logging failed",
            ticketId,
          });
        }

        const userEmailQuery = `
              SELECT email
              FROM users
              WHERE id = ?`;

        database.query(
          userEmailQuery,
          [req.user.userId],
          (emailError, users) => {
            if (emailError) {
              console.error("Failed to retrieve requester email:", emailError);
            } else if (users.length > 0 && users[0].email) {
              sendEmail({
                to: users[0].email,
                subject: `Ticket Created: ${ticketNumber}`,
                text: `
Hello,

Your IT support ticket has been created successfully.

Ticket Number: ${ticketNumber}
Title: ${title.trim()}
Priority: ${priority}
Status: OPEN

Our support team will review your request.

Regards,
IT Support Team
        `.trim(),
              }).catch((error) => {
                console.error("Ticket creation email failed:", error.message);
              });
            }
          },
        );

        return res.status(201).json({
          message: "Ticket created successfully",
          ticket: {
            id: ticketId,
            ticket_number: ticketNumber,
            title: title.trim(),
            description: description.trim(),
            requester_id: req.user.userId,
            category_id: categoryId,
            priority,
            status: "OPEN",
          },
        });
      });
    });
  });
};

export const getTickets = (req, res) => {
  const userId = Number(req.user.userId);
  const roleId = Number(req.user.roleId);

  const {
    search,
    status,
    priority,
    category_id,
    assigned_agent_id,
    team_id,
    requester_id,
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    !Number.isInteger(limitNumber) ||
    limitNumber < 1 ||
    limitNumber > 100
  ) {
    return res.status(400).json({
      message: "Invalid pagination parameters",
    });
  }

  const allowedSortFields = {
    createdAt: "created_at",
    updatedAt: "updated_at",
    priority: "priority",
    status: "status",
  };

  if (!allowedSortFields[sortBy]) {
    return res.status(400).json({
      message: "Invalid sortBy parameter",
    });
  }

  const order = String(sortOrder).toUpperCase();

  if (!["ASC", "DESC"].includes(order)) {
    return res.status(400).json({
      message: "Invalid sortOrder parameter",
    });
  }

  const conditions = [];
  const values = [];

  // Role-based ticket visibility
  if (roleId === 1) {
    conditions.push("requester_id = ?");
    values.push(userId);
  } else if (roleId === 2) {
    conditions.push("assigned_agent_id = ?");
    values.push(userId);
  } else if (roleId !== 3) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  // Search
  if (search) {
    conditions.push(`
      (
        ticket_number LIKE ?
        OR title LIKE ?
        OR description LIKE ?
      )
    `);

    const searchValue = `%${search}%`;
    values.push(searchValue, searchValue, searchValue);
  }

  // Filtering
  const filters = {
    status,
    priority,
    category_id,
    assigned_agent_id,
    team_id,
    requester_id,
  };

  for (const [field, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      conditions.push(`${field} = ?`);
      values.push(value);
    }
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const offset = (pageNumber - 1) * limitNumber;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM tickets
    ${whereClause}
  `;

  database.query(countQuery, values, (countError, countResult) => {
    if (countError) {
      console.error("Ticket count error:", countError);
      return res.status(500).json({
        message: "Failed to count tickets",
      });
    }

    const total = countResult[0].total;

    const ticketsQuery = `
      SELECT *
      FROM tickets
      ${whereClause}
      ORDER BY ${allowedSortFields[sortBy]} ${order}, id DESC
      LIMIT ? OFFSET ?
    `;

    database.query(
      ticketsQuery,
      [...values, limitNumber, offset],
      (error, tickets) => {
        if (error) {
          console.error("Error fetching tickets:", error);
          return res.status(500).json({
            message: "Failed to fetch tickets",
          });
        }

        return res.status(200).json({
          message: "Tickets retrieved successfully",
          data: tickets,
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages: Math.ceil(total / limitNumber),
          },
        });
      },
    );
  });
};

export const getTicketById = (req, res) => {
  const ticketId = req.params.id;

  const query = `
    SELECT *
    FROM tickets
    WHERE id = ?
  `;

  database.query(query, [ticketId], (error, results) => {
    if (error) {
      console.error("Error fetching ticket:", error);

      return res.status(500).json({
        message: "Failed to fetch ticket",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const ticket = results[0];

    // Employee can only view their own tickets
    if (req.user.roleId === 1 && ticket.requester_id !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to view this ticket",
      });
    }

    // Support agent can only view tickets assigned to them
    if (req.user.roleId === 2 && ticket.assigned_agent_id !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to view this ticket",
      });
    }

    // Admin can view any ticket
    if (![1, 2, 3].includes(req.user.roleId)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json({
      message: "Ticket retrieved successfully",
      ticket,
    });
  });
};

export const assignTicket = (req, res) => {
  const ticketId = req.params.id;
  const { assigned_agent_id, team_id } = req.body;

  if (!assigned_agent_id || !team_id) {
    return res.status(400).json({
      message: "Assigned agent and team are required",
    });
  }

  // 1. Check whether the ticket exists
  database.query(
    "SELECT id, assigned_agent_id, team_id, status FROM tickets WHERE id = ?",
    [ticketId],
    (ticketError, ticketResults) => {
      if (ticketError) {
        console.error("Error checking ticket:", ticketError);
        return res.status(500).json({
          message: "Failed to check ticket",
        });
      }

      if (ticketResults.length === 0) {
        return res.status(404).json({
          message: "Ticket not found",
        });
      }
      const existingTicket = ticketResults[0];

      // 2. Check whether the team exists
      database.query(
        "SELECT id FROM support_teams WHERE id = ?",
        [team_id],
        (teamCheckError, teamCheckResults) => {
          if (teamCheckError) {
            console.error("Error checking team:", teamCheckError);
            return res.status(500).json({
              message: "Failed to check team",
            });
          }

          if (teamCheckResults.length === 0) {
            return res.status(404).json({
              message: "Team not found",
            });
          }

          // 3. Check whether the assigned user is a support agent
          database.query(
            "SELECT id FROM users WHERE id = ? AND role_id = 2",
            [assigned_agent_id],
            (agentError, agentResults) => {
              if (agentError) {
                console.error("Error checking support agent:", agentError);
                return res.status(500).json({
                  message: "Failed to check support agent",
                });
              }

              if (agentResults.length === 0) {
                return res.status(400).json({
                  message: "Assigned user is not a valid support agent",
                });
              }

              // 4. Check whether the support agent belongs to the team
              database.query(
                `SELECT team_id
                 FROM team_members
                 WHERE team_id = ? AND user_id = ?`,
                [team_id, assigned_agent_id],
                (membershipError, membershipResults) => {
                  if (membershipError) {
                    console.error(
                      "Error checking team membership:",
                      membershipError,
                    );
                    return res.status(500).json({
                      message: "Failed to check team membership",
                    });
                  }

                  if (membershipResults.length === 0) {
                    return res.status(400).json({
                      message: "Support agent does not belong to this team",
                    });
                  }

                  // 5. Assign the ticket after all checks pass
                  const query = `
                    UPDATE tickets
                    SET assigned_agent_id = ?,
                        team_id = ?,
                        status = 'ASSIGNED'
                    WHERE id = ?
                  `;

                  database.query(
                    query,
                    [assigned_agent_id, team_id, ticketId],
                    (updateError) => {
                      if (updateError) {
                        console.error("Error assigning ticket:", updateError);
                        return res.status(500).json({
                          message: "Failed to assign ticket",
                        });
                      }

                      const historyQuery = `
  INSERT INTO ticket_history
    (ticket_id, user_id, action, previous_value, new_value)
  VALUES (?, ?, ?, ?, ?)
`;

                      const previousAssignment = JSON.stringify({
                        assigned_agent_id: existingTicket.assigned_agent_id,
                        team_id: existingTicket.team_id,
                        status: existingTicket.status,
                      });

                      const newAssignment = JSON.stringify({
                        assigned_agent_id: Number(assigned_agent_id),
                        team_id: Number(team_id),
                        status: "ASSIGNED",
                      });

                      database.query(
                        historyQuery,
                        [
                          Number(ticketId),
                          Number(req.user.userId),
                          "TICKET_ASSIGNED",
                          previousAssignment,
                          newAssignment,
                        ],
                        
(historyError) => {
  if (historyError) {
    console.error(
      "Error recording assignment history:",
      historyError
    );

    return res.status(500).json({
      message: "Ticket was assigned, but history logging failed",
      ticketId: Number(ticketId),
    });
  }

  // Retrieve ticket details and the assigned agent's email
  const notificationQuery = `
    SELECT
      t.ticket_number,
      t.title,
      t.description,
      t.priority,
      u.email AS agent_email,
      u.name AS agent_name
    FROM tickets t
    JOIN users u ON u.id = t.assigned_agent_id
    WHERE t.id = ?
  `;

  database.query(
    notificationQuery,
    [ticketId],
    (notificationError, rows) => {
      if (notificationError) {
        console.error(
          "Failed to retrieve assignment email details:",
          notificationError
        );
      } else if (rows.length > 0 && rows[0].agent_email) {
        const ticket = rows[0];

        sendEmail({
          to: ticket.agent_email,
          subject: `Ticket Assigned: ${ticket.ticket_number}`,
          text: `
Hello ${ticket.agent_name || "Support Agent"},

A support ticket has been assigned to you.

Ticket Number: ${ticket.ticket_number}
Title: ${ticket.title}
Priority: ${ticket.priority}
Status: ASSIGNED

Please log in to the IT Support System to review the ticket.

Regards,
IT Support Team
          `.trim(),
        }).catch((error) => {
          console.error(
            "Assignment notification email failed:",
            error.message
          );
        });
      }

      // Email failure must not prevent a successful assignment response
      return res.status(200).json({
        message: "Ticket assigned successfully",
        ticketId: Number(ticketId),
        assigned_agent_id: Number(assigned_agent_id),
        team_id: Number(team_id),
        status: "ASSIGNED",
      });
    }
  );
}

                      );
                    },
                  );
                },
              );
            },
          );
        },
      );
    },
  );
};

export const updateTicketStatus = (req, res) => {
  const ticketId = Number(req.params.id);
  const userId = Number(req.user.userId);
  const roleId = Number(req.user.roleId);
  const { status } = req.body;

  const allowedStatuses = [
    "OPEN",
    "ASSIGNED",
    "IN_PROGRESS",
    "WAITING_FOR_USER",
    "RESOLVED",
    "CLOSED",
    "REOPENED",
  ];

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return res.status(400).json({
      message: "Invalid ticket ID",
    });
  }

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid ticket status",
      allowedStatuses,
    });
  }

  if (![1, 2, 3].includes(roleId)) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  database.beginTransaction((transactionError) => {
    if (transactionError) {
      console.error("Failed to start transaction:", transactionError);
      return res.status(500).json({
        message: "Failed to update ticket status",
      });
    }

    // Lock the ticket while checking and updating its status.
    database.query(
      "SELECT * FROM tickets WHERE id = ? FOR UPDATE",
      [ticketId],
      (selectError, results) => {
        if (selectError) {
          return rollbackWithError(selectError, "Failed to fetch ticket");
        }

        if (results.length === 0) {
          return rollbackWithResponse(404, {
            message: "Ticket not found",
          });
        }

        const ticket = results[0];

        // Check access before revealing transition rules.
        if (roleId === 1 && Number(ticket.requester_id) !== userId) {
          return rollbackWithResponse(403, {
            message: "You are not allowed to update this ticket",
          });
        }

        if (roleId === 2 && Number(ticket.assigned_agent_id) !== userId) {
          return rollbackWithResponse(403, {
            message: "You are not allowed to update this ticket",
          });
        }

        const allowedTransitions = {
          OPEN: ["ASSIGNED", "IN_PROGRESS", "CLOSED"],
          ASSIGNED: ["IN_PROGRESS", "WAITING_FOR_USER", "RESOLVED"],
          IN_PROGRESS: ["WAITING_FOR_USER", "RESOLVED"],
          WAITING_FOR_USER: ["IN_PROGRESS", "RESOLVED"],
          RESOLVED: ["CLOSED", "REOPENED"],
          CLOSED: ["REOPENED"],
          REOPENED: ["ASSIGNED", "IN_PROGRESS", "CLOSED"],
        };

        if (!allowedTransitions[ticket.status]?.includes(status)) {
          return rollbackWithResponse(400, {
            message: `Cannot change ticket status from ${ticket.status} to ${status}`,
          });
        }

        let updateQuery;
        let updateValues;

        switch (status) {
          case "RESOLVED":
            updateQuery = `
              UPDATE tickets
              SET status = ?,
                  resolved_at = CURRENT_TIMESTAMP,
                  closed_at = NULL
              WHERE id = ?
            `;
            updateValues = [status, ticketId];
            break;

          case "CLOSED":
            updateQuery = `
              UPDATE tickets
              SET status = ?,
                  closed_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `;
            updateValues = [status, ticketId];
            break;

          case "REOPENED":
            updateQuery = `
              UPDATE tickets
              SET status = ?,
                  resolved_at = NULL,
                  closed_at = NULL
              WHERE id = ?
            `;
            updateValues = [status, ticketId];
            break;

          default:
            updateQuery = `
              UPDATE tickets
              SET status = ?,
                  resolved_at = NULL,
                  closed_at = NULL
              WHERE id = ?
            `;
            updateValues = [status, ticketId];
        }

        database.query(updateQuery, updateValues, (updateError) => {
          if (updateError) {
            return rollbackWithError(
              updateError,
              "Failed to update ticket status",
            );
          }

          const historyQuery = `
              INSERT INTO ticket_history
                (ticket_id, user_id, action, previous_value, new_value)
              VALUES (?, ?, ?, ?, ?)
            `;

          database.query(
            historyQuery,
            [ticketId, userId, "STATUS_UPDATED", ticket.status, status],
            (historyError) => {
              if (historyError) {
                return rollbackWithError(
                  historyError,
                  "Failed to record ticket history",
                );
              }

              database.commit((commitError) => {
                if (commitError) {
                  console.error("Transaction commit failed:", commitError);

                  return database.rollback(() => {
                    return res.status(500).json({
                      message: "Failed to save ticket status and history",
                    });
                  });
                }

                return res.status(200).json({
                  message: "Ticket status updated successfully",
                  ticketId,
                  previousStatus: ticket.status,
                  status,
                });
              });
            },
          );
        });

        function rollbackWithResponse(httpStatus, body) {
          database.rollback((rollbackError) => {
            if (rollbackError) {
              console.error("Transaction rollback failed:", rollbackError);
            }

            return res.status(httpStatus).json(body);
          });
        }

        function rollbackWithError(error, message) {
          console.error(message + ":", error);

          database.rollback((rollbackError) => {
            if (rollbackError) {
              console.error("Transaction rollback failed:", rollbackError);
            }

            return res.status(500).json({
              message,
            });
          });
        }
      },
    );
  });
};

export const getTicketHistory = (req, res) => {
  const { id } = req.params;
  const ticketId = Number(id);
  const userId = Number(req.user.userId);
  const roleId = Number(req.user.roleId);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return res.status(400).json({
      message: "Invalid ticket ID",
    });
  }

  // First, check whether the ticket exists.
  const ticketQuery = `
    SELECT id, requester_id, assigned_agent_id
    FROM tickets
    WHERE id = ?
  `;

  database.query(ticketQuery, [ticketId], (error, tickets) => {
    if (error) {
      console.error("Error checking ticket:", error);
      return res.status(500).json({
        message: "Failed to retrieve ticket",
      });
    }

    if (tickets.length === 0) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const ticket = tickets[0];

    // Employees can view history for their own tickets.
    if (roleId === 1 && Number(ticket.requester_id) !== userId) {
      return res.status(403).json({
        message: "You can only view history for your own tickets",
      });
    }

    // Support agents can view history for tickets assigned to them.
    if (roleId === 2 && Number(ticket.assigned_agent_id) !== userId) {
      return res.status(403).json({
        message: "You can only view history for tickets assigned to you",
      });
    }

    if (![1, 2, 3].includes(roleId)) {
      return res.status(403).json({
        message: "You are not authorized to view ticket history",
      });
    }

    // Retrieve the ticket's audit trail.
    const historyQuery = `
      SELECT
        th.id,
        th.ticket_id,
        th.user_id,
        u.name AS user_name,
        th.action,
        th.previous_value,
        th.new_value,
        th.created_at
      FROM ticket_history th
      LEFT JOIN users u ON th.user_id = u.id
      WHERE th.ticket_id = ?
      ORDER BY th.created_at DESC, th.id DESC
    `;

    database.query(historyQuery, [ticketId], (historyError, history) => {
      if (historyError) {
        console.error("Error retrieving ticket history:", historyError);
        return res.status(500).json({
          message: "Failed to retrieve ticket history",
        });
      }

      return res.status(200).json({
        ticketId,
        history,
      });
    });
  });
};
