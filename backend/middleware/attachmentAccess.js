import database from "../database/database.js";

export const canAccessTicket = async (req, res, next) => {
  try {
    const ticketId = Number(req.params.id);
    const userId = req.user.userId;
    const roleId = Number(req.user.roleId);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        message: "Invalid ticket ID",
      });
    }

    const [tickets] = await database.promise().query(
      `SELECT id, requester_id, assigned_agent_id
       FROM tickets
       WHERE id = ?`,
      [ticketId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const ticket = tickets[0];

    // Admin can access all tickets.
    if (roleId === 3) {
      return next();
    }

    // Employees can access their own tickets.
    if (
      roleId === 1 &&
      Number(ticket.requester_id) === Number(userId)
    ) {
      return next();
    }

    // Agents can access tickets assigned to them.
    if (
      roleId === 2 &&
      Number(ticket.assigned_agent_id) === Number(userId)
    ) {
      return next();
    }

    return res.status(403).json({
      message: "You are not authorized to access this ticket",
    });
  } catch (error) {
    console.error("Ticket attachment authorization error:", error);

    return res.status(500).json({
      message: "Failed to verify ticket access",
    });
  }
};