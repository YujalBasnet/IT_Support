import database from "../database/database.js";

/**
 * Creates an in-app notification for a given user.
 * Silently catches errors to prevent interrupting primary workflows.
 *
 * @param {Object} params
 * @param {number} params.userId - Recipient user ID
 * @param {number|null} [params.ticketId] - Associated ticket ID (optional)
 * @param {string} params.type - Notification type (e.g. 'TICKET_CREATED', 'TICKET_ASSIGNED', 'STATUS_UPDATED', etc.)
 * @param {string} params.message - Human-readable notification message
 */
export const createNotification = async ({ userId, ticketId = null, type, message }) => {
  if (!userId || !type || !message) {
    console.warn("createNotification skipped: missing userId, type, or message");
    return null;
  }

  try {
    const query = `
      INSERT INTO notifications (user_id, ticket_id, type, message, is_read, created_at)
      VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `;
    const [result] = await database.promise().query(query, [userId, ticketId, type, message]);
    return result.insertId;
  } catch (error) {
    console.error("Failed to create in-app notification:", error.message);
    return null;
  }
};

/**
 * Retrieves notifications for a specific user with pagination and unread counts.
 *
 * @param {Object} params
 * @param {number} params.userId
 * @param {boolean} [params.unreadOnly=false]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 */
export const getUserNotifications = async ({ userId, unreadOnly = false, page = 1, limit = 20 }) => {
  const db = database.promise();
  const offset = (page - 1) * limit;

  const whereConditions = ["n.user_id = ?"];
  const queryParams = [userId];

  if (unreadOnly) {
    whereConditions.push("n.is_read = 0");
  }

  const whereClause = whereConditions.join(" AND ");

  // Count unread
  const [unreadResult] = await db.query(
    "SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0",
    [userId]
  );
  const unreadCount = unreadResult[0]?.unread_count || 0;

  // Count total filtered
  const [totalResult] = await db.query(
    `SELECT COUNT(*) AS total FROM notifications n WHERE ${whereClause}`,
    queryParams
  );
  const total = totalResult[0]?.total || 0;

  // Retrieve notifications with ticket details
  const notificationsQuery = `
    SELECT
      n.id,
      n.user_id,
      n.ticket_id,
      n.type,
      n.message,
      n.is_read,
      n.created_at,
      t.ticket_number,
      t.title AS ticket_title,
      t.status AS ticket_status,
      t.priority AS ticket_priority
    FROM notifications n
    LEFT JOIN tickets t ON t.id = n.ticket_id
    WHERE ${whereClause}
    ORDER BY n.created_at DESC, n.id DESC
    LIMIT ? OFFSET ?
  `;

  const [notifications] = await db.query(notificationsQuery, [...queryParams, limit, offset]);

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Marks a single notification as read for the user.
 */
export const markNotificationAsRead = async ({ notificationId, userId }) => {
  const [result] = await database.promise().query(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [notificationId, userId]
  );
  return result.affectedRows > 0;
};

/**
 * Marks all notifications as read for the user.
 */
export const markAllNotificationsAsRead = async ({ userId }) => {
  const [result] = await database.promise().query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
    [userId]
  );
  return result.affectedRows;
};

