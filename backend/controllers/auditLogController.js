import database from "../database/database.js";

/**
 * Get system audit logs with filtering and pagination
 * Restricted to Admins (roleId = 3)
 */
export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "20",
      action,
      resource_type,
      user_id,
      startDate,
      endDate,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNumber - 1) * limitNumber;

    const conditions = [];
    const values = [];

    if (action) {
      conditions.push("a.action = ?");
      values.push(action);
    }

    if (resource_type) {
      conditions.push("a.resource_type = ?");
      values.push(resource_type);
    }

    if (user_id) {
      conditions.push("a.user_id = ?");
      values.push(Number(user_id));
    }

    if (startDate) {
      conditions.push("a.created_at >= ?");
      values.push(new Date(startDate));
    }

    if (endDate) {
      conditions.push("a.created_at <= ?");
      values.push(new Date(endDate));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count total matching logs
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM audit_logs a
      ${whereClause}
    `;

    const [countResult] = await database.promise().query(countQuery, values);
    const total = countResult[0].total;

    // Fetch audit records joined with actor user info
    const logsQuery = `
      SELECT
        a.id,
        a.user_id,
        u.name AS actor_name,
        u.email AS actor_email,
        a.action,
        a.resource_type,
        a.resource_id,
        a.changes,
        a.created_at
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      ${whereClause}
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT ? OFFSET ?
    `;

    const [logs] = await database
      .promise()
      .query(logsQuery, [...values, limitNumber, offset]);

    return res.status(200).json({
      message: "Audit logs retrieved successfully",
      data: logs,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return res.status(500).json({
      message: "Failed to retrieve audit logs",
    });
  }
};
