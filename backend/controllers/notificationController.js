import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService.js";

/**
 * Controller to retrieve notifications for the logged-in user.
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = Number(req.user.userId);
    const unreadOnly = req.query.unreadOnly === "true" || req.query.unreadOnly === "1";
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const result = await getUserNotifications({
      userId,
      unreadOnly,
      page,
      limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      message: "Failed to retrieve notifications",
    });
  }
};

/**
 * Controller to mark a single notification as read.
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = Number(req.user.userId);
    const notificationId = Number(req.params.id);

    if (!Number.isSafeInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const updated = await markNotificationAsRead({
      notificationId,
      userId,
    });

    if (!updated) {
      return res.status(404).json({
        message: "Notification not found or already read",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      id: notificationId,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return res.status(500).json({
      message: "Failed to update notification",
    });
  }
};

/**
 * Controller to mark all unread notifications as read.
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = Number(req.user.userId);
    const count = await markAllNotificationsAsRead({ userId });

    return res.status(200).json({
      message: "All notifications marked as read",
      updatedCount: count,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return res.status(500).json({
      message: "Failed to update notifications",
    });
  }
};

