
import database from "../database/database.js";

export const createAuditLog = async ({
  userId,
  action,
  resourceType,
  resourceId = null,
  changes = null,
}) => {
  try {
    const query = `
      INSERT INTO audit_logs
        (user_id, action, resource_type, resource_id, changes)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      userId,
      action,
      resourceType,
      resourceId,
      changes === null ? null : JSON.stringify(changes),
    ];

    const [result] = await database.promise().query(query, values);

    return result.insertId;
  } catch (error) {
    console.error("Failed to create audit log:", error);
    return null;
  }
};
