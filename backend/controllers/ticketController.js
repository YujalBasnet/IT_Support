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