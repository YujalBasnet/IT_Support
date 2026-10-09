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


export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const [teams] = await database.promise().query(
      `SELECT id, name, description
       FROM support_teams
       WHERE id = ?`,
      [id]
    );

    if (teams.length === 0) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    res.json({
      message: "Team retrieved successfully",
      team: teams[0],
    });
  } catch (error) {
    console.error("Get team by ID error:", error);

    res.status(500).json({
      message: "Failed to retrieve team",
    });
  }
};


export const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!Number.isInteger(user_id) || user_id <= 0) {
      return res.status(400).json({
        message: "A valid user_id is required",
      });
    }

    // Check whether the team exists
    const [teams] = await database.promise().query(
      "SELECT id FROM support_teams WHERE id = ?",
      [id]
    );

    if (teams.length === 0) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // Check whether the user exists
    const [users] = await database.promise().query(
      "SELECT id FROM users WHERE id = ?",
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent duplicate membership
    const [members] = await database.promise().query(
      `SELECT id FROM team_members
       WHERE team_id = ? AND user_id = ?`,
      [id, user_id]
    );

    if (members.length > 0) {
      return res.status(409).json({
        message: "User is already a member of this team",
      });
    }

    const [result] = await database.promise().query(
      `INSERT INTO team_members (team_id, user_id)
       VALUES (?, ?)`,
      [id, user_id]
    );

    return res.status(201).json({
      message: "Team member added successfully",
      member: {
        id: result.insertId,
        team_id: Number(id),
        user_id,
      },
    });
  } catch (error) {
    console.error("Add team member error:", error);

    return res.status(500).json({
      message: "Failed to add team member",
    });
  }
};



export const getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether the team exists
    const [teams] = await database.promise().query(
      "SELECT id, name FROM support_teams WHERE id = ?",
      [id]
    );

    if (teams.length === 0) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // Retrieve the users who belong to this team
    const [members] = await database.promise().query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.profile_image,
         u.account_status,
         r.name AS role,
         tm.joined_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       JOIN roles r ON u.role_id = r.id
       WHERE tm.team_id = ?
       ORDER BY tm.joined_at DESC`,
      [id]
    );

    return res.status(200).json({
      message: "Team members retrieved successfully",
      team: teams[0],
      members,
    });
  } catch (error) {
    console.error("Get team members error:", error);

    return res.status(500).json({
      message: "Failed to retrieve team members",
    });
  }
};