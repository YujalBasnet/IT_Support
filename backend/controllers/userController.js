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