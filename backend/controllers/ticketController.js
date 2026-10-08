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