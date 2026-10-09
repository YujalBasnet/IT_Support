import database from "../database/database.js";

export const createTicket = (req, res) => {
  const { title, description, category_id, priority } = req.body;

  // Validate required fields
  if (!title || !description || !category_id) {
    return res.status(400).json({
      message: "Title, description, and category are required",
    });
  }

  // Generate a unique ticket number
  const ticketNumber = `TKT-${Date.now()}`;

  const query = `
    INSERT INTO tickets
    (ticket_number, title, description, requester_id, category_id, priority)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    ticketNumber,
    title,
    description,
    req.user.userId,
    category_id,
    priority || "MEDIUM",
  ];

  database.query(query, values, (error, result) => {
    if (error) {
      console.error("Error creating ticket:", error);

      return res.status(500).json({
        message: "Failed to create ticket",
      });
    }

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: {
        id: result.insertId,
        ticket_number: ticketNumber,
        title,
        description,
        requester_id: req.user.userId,
        category_id,
        priority: priority || "MEDIUM",
        status: "OPEN",
      },
    });
  });
};

export const getTickets = (req, res) => {
  let query;
  let values;

  if (req.user.roleId === 1) {
    // Employee: only their own tickets
    query = `
      SELECT *
      FROM tickets
      WHERE requester_id = ?
      ORDER BY created_at DESC
    `;

    values = [req.user.userId];
  } else if (req.user.roleId === 2) {
    // Support agent: tickets assigned to them
    query = `
      SELECT *
      FROM tickets
      WHERE assigned_agent_id = ?
      ORDER BY created_at DESC
    `;

    values = [req.user.userId];
  } else if (req.user.roleId === 3) {
    // Admin: all tickets
    query = `
      SELECT *
      FROM tickets
      ORDER BY created_at DESC
    `;

    values = [];
  } else {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  database.query(query, values, (error, results) => {
    if (error) {
      console.error("Error fetching tickets:", error);

      return res.status(500).json({
        message: "Failed to fetch tickets",
      });
    }

    res.status(200).json({
      message: "Tickets retrieved successfully",
      tickets: results,
    });
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
    if (
      req.user.roleId === 1 &&
      ticket.requester_id !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You are not allowed to view this ticket",
      });
    }

    // Support agent can only view tickets assigned to them
    if (
      req.user.roleId === 2 &&
      ticket.assigned_agent_id !== req.user.userId
    ) {
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
    "SELECT id FROM tickets WHERE id = ?",
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

      // 2. Check whether the assigned user is a support agent
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

          // 3. Check whether the support agent belongs to the team
          database.query(
            "SELECT team_id FROM team_members WHERE team_id = ? AND user_id = ?",
            [team_id, assigned_agent_id],
            (teamError, teamResults) => {
              
              if (teamError) {
                console.error("Error checking team membership:", teamError);
                return res.status(500).json({
                  message: "Failed to check team membership",
                });
              }

              if (teamResults.length === 0) {
                return res.status(400).json({
                  message: "Support agent does not belong to this team",
                });
              }

              // 4. Assign the ticket after all checks pass
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
        }
      );
    }
  );
};




export const updateTicketStatus = (req, res) => {
  console.log("updateTicketStatus controller reached");
  console.log("Ticket ID:", req.params.id);
  console.log("Requested status:", req.body.status);
  const ticketId = req.params.id;
  const { status } = req.body;

  const userId = req.user.userId;
  const roleId = req.user.roleId;

  console.log("Logged-in user:", req.user);
  console.log("User ID:", userId);
  console.log("Role ID:", roleId);
  

  const allowedStatuses = [
    "OPEN",
    "ASSIGNED",
    "IN_PROGRESS",
    "WAITING_FOR_USER",
    "RESOLVED",
    "CLOSED",
    "REOPENED",
  ];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid ticket status",
      allowedStatuses,
    });
  }

  // Find the ticket first
  database.query(
    "SELECT * FROM tickets WHERE id = ?",
    [ticketId],
    (error, results) => {
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
      console.log("Current database status:", ticket.status);
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
          return res.status(400).json({
              message: `Cannot change ticket status from ${ticket.status} to ${status}`,
             });
          }

      // Employees can only update their own tickets
      if (roleId === 1 && ticket.requester_id !== userId) {
        return res.status(403).json({
          message: "You are not allowed to update this ticket",
        });
      }

      // Support agents can only update tickets assigned to them
      if (roleId === 2 && ticket.assigned_agent_id !== userId) {
        return res.status(403).json({
          message: "You are not allowed to update this ticket",
        });
      }

      // Only employees, support agents, and admins are allowed
      if (![1, 2, 3].includes(roleId)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

     

      
let query;
let values;

switch (status) {
  case "RESOLVED":
    query = `
      UPDATE tickets
      SET status = ?,
          resolved_at = CURRENT_TIMESTAMP,
          closed_at = NULL
      WHERE id = ?
    `;
    values = [status, ticketId];
    break;

  case "CLOSED":
    query = `
      UPDATE tickets
      SET status = ?,
          closed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    values = [status, ticketId];
    break;

  case "REOPENED":
    query = `
      UPDATE tickets
      SET status = ?,
          resolved_at = NULL,
          closed_at = NULL
      WHERE id = ?
    `;
    values = [status, ticketId];
    break;

  default:
    query = `
      UPDATE tickets
      SET status = ?,
          resolved_at = NULL,
          closed_at = NULL
      WHERE id = ?
    `;
    values = [status, ticketId];
}


        if (typeof query !== "string" || !query.trim()) {
  console.error("SQL query was not assigned:", { status, query });

  return res.status(500).json({
    message: "Internal error: status update query is missing",
  });
}

      database.query(query, values, (updateError, result) => {
  if (updateError) {
    console.error("Error updating ticket status:", updateError);
    return res.status(500).json({
      message: "Failed to update ticket status",
    });
  }

  console.log("Updated rows:", result.affectedRows);

  return res.status(200).json({
    message: "Ticket status updated successfully",
    ticketId: Number(ticketId),
    status,
  });
});
    }
  );
};

