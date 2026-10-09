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


export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Team name is required",
      });
    }

    const [existingTeams] = await database.promise().query(
      "SELECT id FROM support_teams WHERE name = ?",
      [name.trim()]
    );

    if (existingTeams.length > 0) {
      return res.status(409).json({
        message: "A team with this name already exists",
      });
    }

    const [result] = await database.promise().query(
      `INSERT INTO support_teams (name, description)
       VALUES (?, ?)`,
      [name.trim(), description?.trim() || null]
    );

    res.status(201).json({
      message: "Team created successfully",
      team: {
        id: result.insertId,
        name: name.trim(),
        description: description?.trim() || null,
      },
    });
  } catch (error) {
    console.error("Create team error:", error);

    res.status(500).json({
      message: "Failed to create team",
    });
  }
};