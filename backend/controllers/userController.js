import database from "../database/database.js";

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

    const allowedRoles = [
      "EMPLOYEE",
      "SUPPORT_AGENT",
      "ADMIN",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
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
      "SELECT id FROM users WHERE id = ?",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await database.promise().query(
      "UPDATE users SET role_id = ? WHERE id = ?",
      [roles[0].id, id]
    );

    res.json({
      message: "User role updated successfully",
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

    const allowedStatuses = ["ACTIVE", "INACTIVE"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid account status",
      });
    }

    const [users] = await database.promise().query(
      "SELECT id FROM users WHERE id = ?",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await database.promise().query(
      "UPDATE users SET account_status = ? WHERE id = ?",
      [status, id]
    );

    res.json({
      message: "User status updated successfully",
    });
  } catch (error) {
    console.error("Update user status error:", error);

    res.status(500).json({
      message: "Failed to update user status",
    });
  }
};