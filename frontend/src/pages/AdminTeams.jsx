import { useEffect, useState } from "react";
import {
  Users2,
  Plus,
  Edit2,
  UserPlus,
  Trash2,
  UserCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
} from "lucide-react";
import api from "../services/api";

// In-memory cache for instant navigation without loading flashes
let cachedTeams = null;

export default function AdminTeams() {
  const [teams, setTeams] = useState(() => cachedTeams || []);
  const [loading, setLoading] = useState(() => !cachedTeams);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Create / Edit Team Modal
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({ name: "", description: "" });
  const [submittingTeam, setSubmittingTeam] = useState(false);

  // Manage Roster Modal
  const [rosterTeam, setRosterTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [rosterMessage, setRosterMessage] = useState({ type: "", text: "" });

  // Fetch all support teams
  const fetchTeams = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/teams");
      const list = Array.isArray(data.teams) ? data.teams : [];
      cachedTeams = list;
      setTeams(list);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setError(err.response?.data?.message || "Failed to load support teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams(Boolean(cachedTeams));
  }, []);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTeam(null);
    setTeamForm({ name: "", description: "" });
    setIsTeamModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name || "",
      description: team.description || "",
    });
    setIsTeamModalOpen(true);
  };

  // Submit Create or Edit Team
  const handleSubmitTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.name.trim()) return;

    setSubmittingTeam(true);
    setMessage({ type: "", text: "" });

    try {
      if (editingTeam) {
        await api.patch(`/teams/${editingTeam.id}`, {
          name: teamForm.name.trim(),
          description: teamForm.description.trim(),
        });
        setMessage({
          type: "success",
          text: `Support team "${teamForm.name}" updated successfully.`,
        });
      } else {
        await api.post("/teams", {
          name: teamForm.name.trim(),
          description: teamForm.description.trim(),
        });
        setMessage({
          type: "success",
          text: `Support team "${teamForm.name}" created successfully.`,
        });
      }

      setIsTeamModalOpen(false);
      fetchTeams();
    } catch (err) {
      console.error("Failed to save team:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save support team.",
      });
    } finally {
      setSubmittingTeam(false);
    }
  };

  // Open Roster Modal for a team
  const handleOpenRoster = async (team) => {
    setRosterTeam(team);
    setRosterMessage({ type: "", text: "" });
    setSelectedAgentId("");
    setLoadingMembers(true);

    try {
      // 1. Fetch team members
      const { data: memberData } = await api.get(`/teams/${team.id}/members`);
      const currentMemberList = Array.isArray(memberData.members)
        ? memberData.members
        : [];
      setMembers(currentMemberList);

      // 2. Fetch all users to find available Support Agents
      const { data: userData } = await api.get("/users");
      const allUsers = Array.isArray(userData.users) ? userData.users : [];

      const currentMemberUserIds = new Set(
        currentMemberList.map((m) => Number(m.id))
      );

      // Filter: Role must be SUPPORT_AGENT, active, and not already in team
      const eligible = allUsers.filter(
        (u) =>
          u.role === "SUPPORT_AGENT" &&
          u.account_status === "ACTIVE" &&
          !currentMemberUserIds.has(Number(u.id))
      );

      setAvailableAgents(eligible);
    } catch (err) {
      console.error("Failed to load roster:", err);
      setRosterMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load team roster.",
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  // Add agent to team
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedAgentId || !rosterTeam) return;

    setAddingMember(true);
    setRosterMessage({ type: "", text: "" });

    try {
      await api.post(`/teams/${rosterTeam.id}/members`, {
        user_id: Number(selectedAgentId),
      });

      setRosterMessage({
        type: "success",
        text: "Agent added to team roster.",
      });

      // Refresh roster
      handleOpenRoster(rosterTeam);
    } catch (err) {
      console.error("Failed to add agent to team:", err);
      setRosterMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to add agent.",
      });
    } finally {
      setAddingMember(false);
    }
  };

  // Remove agent from team
  const handleRemoveMember = async (userId, agentName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${agentName || "this agent"} from the team?`
      )
    ) {
      return;
    }

    setRosterMessage({ type: "", text: "" });

    try {
      await api.delete(`/teams/${rosterTeam.id}/members/${userId}`);
      setRosterMessage({
        type: "success",
        text: `${agentName || "Agent"} removed from team roster.`,
      });
      handleOpenRoster(rosterTeam);
    } catch (err) {
      console.error("Failed to remove agent:", err);
      setRosterMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to remove member.",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-purple-600">
            System Administration
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Support Teams
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Organize support agents into specialized tiers or teams (e.g., Network, Hardware, DevOps) to streamline ticket assignment.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 self-start rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-purple-700 transition cursor-pointer"
        >
          <Plus size={20} />
          Create Support Team
        </button>
      </div>

      {/* Global Message Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0" />
          ) : (
            <AlertCircle size={18} className="shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Teams Grid */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <RefreshCw size={28} className="animate-spin mx-auto text-purple-600 mb-2" />
          <p className="text-sm font-medium">Loading support teams...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8">
          <Users2 size={44} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No support teams yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Create your first support team to group agents and assign incoming IT support tickets.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition"
          >
            <Plus size={16} />
            Create Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Users2 size={24} />
                  </div>
                  <button
                    onClick={() => handleOpenEditModal(team)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Edit team info"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {team.name}
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed min-h-[40px]">
                  {team.description || "No description provided for this team."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  ID: #{team.id}
                </span>

                <button
                  onClick={() => handleOpenRoster(team)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-lg transition cursor-pointer"
                >
                  <UserPlus size={14} />
                  Manage Roster
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Team Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingTeam ? "Edit Support Team" : "Create Support Team"}
              </h3>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={teamForm.name}
                  onChange={(e) =>
                    setTeamForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Infrastructure & Cloud Ops"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={teamForm.description}
                  onChange={(e) =>
                    setTeamForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the functional scope and responsibilities of this team..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  disabled={submittingTeam}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTeam || !teamForm.name.trim()}
                  className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
                >
                  {submittingTeam
                    ? "Saving..."
                    : editingTeam
                    ? "Update Team"
                    : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Roster Modal */}
      {rosterTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {rosterTeam.name} — Team Roster
                </h3>
                <p className="text-xs text-slate-500">
                  Assign active support agents to this team for ticket distribution.
                </p>
              </div>
              <button
                onClick={() => setRosterTeam(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {rosterMessage.text && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 text-xs border ${
                    rosterMessage.type === "success"
                      ? "bg-green-50 text-green-800 border-green-200"
                      : "bg-red-50 text-red-800 border-red-200"
                  }`}
                >
                  {rosterMessage.type === "success" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  <span>{rosterMessage.text}</span>
                </div>
              )}

              {/* Add Member Form */}
              <form
                onSubmit={handleAddMember}
                className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 flex flex-col sm:flex-row items-center gap-3"
              >
                <div className="flex-1 w-full">
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-500 bg-white"
                  >
                    <option value="">
                      {availableAgents.length === 0
                        ? "No additional active support agents available"
                        : "Select support agent to add..."}
                    </option>
                    {availableAgents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({agent.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={addingMember || !selectedAgentId}
                  className="w-full sm:w-auto px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  {addingMember ? "Adding..." : "Add to Team"}
                </button>
              </form>

              {/* Members List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Current Team Members ({members.length})
                </h4>

                {loadingMembers ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-purple-600" />
                    Loading team members...
                  </div>
                ) : members.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                    No support agents currently assigned to this team. Add an agent above.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          {member.profile_image ? (
                            <img
                              src={member.profile_image}
                              alt={member.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                              {member.name?.charAt(0) || "A"}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {member.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {member.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-400 hidden sm:inline">
                            Joined {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : ""}
                          </span>
                          <button
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Remove agent from team"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setRosterTeam(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
