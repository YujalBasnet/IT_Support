import database from "../database/database.js";
import { createAuditLog } from "../services/auditLogService.js";

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

    const newTeamId = result.insertId;

    // Record audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "SUPPORT_TEAM_CREATED",
      resourceType: "SUPPORT_TEAM",
      resourceId: newTeamId,
      changes: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    res.status(201).json({
      message: "Team created successfully",
      team: {
        id: newTeamId,
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
    const teamId = Number(req.params.id);
    const userId = Number(req.body.user_id);

    if (
      !Number.isInteger(teamId) ||
      teamId <= 0 ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        message: "Valid team ID and user_id are required",
      });
    }

    // Check that the team exists.
    const [teams] = await database.promise().query(
      "SELECT id FROM support_teams WHERE id = ?",
      [teamId]
    );

    if (teams.length === 0) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    // Only active support agents can be team members.
    const [users] = await database.promise().query(
      `SELECT u.id, u.account_status, r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = users[0];

    if (user.role !== "SUPPORT_AGENT") {
      return res.status(400).json({
        message: "Only support agents can be added to a team",
      });
    }

    if (user.account_status !== "ACTIVE") {
      return res.status(400).json({
        message: "Inactive users cannot be added to a team",
      });
    }

    // Prevent duplicate membership.
    const [members] = await database.promise().query(
      `SELECT id
       FROM team_members
       WHERE team_id = ? AND user_id = ?`,
      [teamId, userId]
    );

    if (members.length > 0) {
      return res.status(409).json({
        message: "User is already a member of this team",
      });
    }

    const [result] = await database.promise().query(
      `INSERT INTO team_members (team_id, user_id)
       VALUES (?, ?)`,
      [teamId, userId]
    );

    // Record audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "TEAM_MEMBER_ADDED",
      resourceType: "SUPPORT_TEAM",
      resourceId: teamId,
      changes: {
        teamName: teams[0].name,
        addedUserId: userId,
        addedUserName: user.name || null,
      },
    });

    return res.status(201).json({
      message: "Team member added successfully",
      member: {
        id: result.insertId,
        team_id: teamId,
        user_id: userId,
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


export const removeTeamMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

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

    // Check whether the user belongs to this team
    const [members] = await database.promise().query(
      `SELECT id FROM team_members
       WHERE team_id = ? AND user_id = ?`,
      [id, userId]
    );

    if (members.length === 0) {
      return res.status(404).json({
        message: "User is not a member of this team",
      });
    }

    // Remove only the membership record
    await database.promise().query(
      `DELETE FROM team_members
       WHERE team_id = ? AND user_id = ?`,
      [id, userId]
    );

    // Record audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "TEAM_MEMBER_REMOVED",
      resourceType: "SUPPORT_TEAM",
      resourceId: Number(id),
      changes: {
        teamName: teams[0].name,
        removedUserId: Number(userId),
      },
    });

    return res.status(200).json({
      message: "Team member removed successfully",
    });
  } catch (error) {
    console.error("Remove team member error:", error);

    return res.status(500).json({
      message: "Failed to remove team member",
    });
  }
};

// Update support team
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Team name is required",
      });
    }

    const [existing] = await database.promise().query(
      "SELECT id, name, description FROM support_teams WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    const previousTeam = existing[0];

    await database.promise().query(
      `UPDATE support_teams
       SET name = ?, description = ?
       WHERE id = ?`,
      [name.trim(), description?.trim() || null, id]
    );

    // Record audit log
    await createAuditLog({
      userId: req.user.userId,
      action: "SUPPORT_TEAM_UPDATED",
      resourceType: "SUPPORT_TEAM",
      resourceId: Number(id),
      changes: {
        previous: { name: previousTeam.name, description: previousTeam.description },
        new: { name: name.trim(), description: description?.trim() || null },
      },
    });

    return res.status(200).json({
      message: "Team updated successfully",
      team: {
        id: Number(id),
        name: name.trim(),
        description: description?.trim() || null,
      },
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return res.status(500).json({
      message: "Failed to update support team",
    });
  }
};
