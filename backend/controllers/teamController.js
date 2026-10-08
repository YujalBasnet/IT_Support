import database from "../database/database.js";

export const getTeams = async (req, res) => {
  try {
    const [teams] = await database.promise().query(`
      SELECT
        id,
        name,
        description
      FROM support_teams
      ORDER BY id DESC
    `);

    res.json({
      message: "Teams retrieved successfully",
      teams,
    });
  } catch (error) {
    console.error("Get teams error:", error);

    res.status(500).json({
      message: "Failed to retrieve teams",
    });
  }
};