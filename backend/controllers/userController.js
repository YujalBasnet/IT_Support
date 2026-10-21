import database from "../database/database.js";
import { createAuditLog } from "../services/auditLogService.js";

export const getUsers = async (req, res) => {
  try {
    const [users] = await database.promise().query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.profile_image,
        u.account_status,
        r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.id DESC
    `);

    res.json({
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Failed to retrieve users",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await database.promise().query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.profile_image,
        u.account_status,
        r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
      `,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User retrieved successfully",
      user: users[0],
    });
  } catch (error) {
    console.error("Get user by ID error:", error);

    res.status(500).json({
      message: "Failed to retrieve user",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const targetUserId = Number(id);
    const adminUserId = Number(req.user.userId);

    const allowedRoles = ["EMPLOYEE", "SUPPORT_AGENT", "ADMIN"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // Prevent admin from accidentally demoting themselves
    if (targetUserId === adminUserId && role !== "ADMIN") {
      return res.status(400).json({
        message: "Admins cannot change their own administrative role",
      });
    }

    const [roles] = await database.promise().query(
      "SELECT id FROM roles WHERE name = ?",
      [role]
    );

    if (roles.length === 0) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    const [users] = await database.promise().query(
      `SELECT u.id, u.name, u.email, r.name AS current_role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const previousRole = users[0].current_role;

    await database.promise().query(
      "UPDATE users SET role_id = ? WHERE id = ?",
      [roles[0].id, targetUserId]
    );

    // Record audit log
    await createAuditLog({
      userId: adminUserId,
      action: "USER_ROLE_CHANGED",
      resourceType: "USER",
      resourceId: targetUserId,
      changes: {
        userEmail: users[0].email,
        previousRole,
        newRole: role,
      },
    });

    res.json({
      message: "User role updated successfully",
      user: {
        id: targetUserId,
        role,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);

    res.status(500).json({
      message: "Failed to update user role",
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const targetUserId = Number(id);
    const adminUserId = Number(req.user.userId);

    const allowedStatuses = ["ACTIVE", "INACTIVE"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid account status",
      });
    }

    // Prevent admin from deactivating their own account
    if (targetUserId === adminUserId && status === "INACTIVE") {
      return res.status(400).json({
        message: "Admins cannot deactivate their own account",
      });
    }

    const [users] = await database.promise().query(
      "SELECT id, name, email, account_status FROM users WHERE id = ?",
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const previousStatus = users[0].account_status;

    await database.promise().query(
      "UPDATE users SET account_status = ? WHERE id = ?",
      [status, targetUserId]
    );

    // Record audit log
    await createAuditLog({
      userId: adminUserId,
      action: status === "INACTIVE" ? "USER_ACCOUNT_DISABLED" : "USER_ACCOUNT_ACTIVATED",
      resourceType: "USER",
      resourceId: targetUserId,
      changes: {
        userEmail: users[0].email,
        previousStatus,
        newStatus: status,
      },
    });

    res.json({
      message: "User status updated successfully",
      user: {
        id: targetUserId,
        status,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);

    res.status(500).json({
      message: "Failed to update user status",
    });
  }
};