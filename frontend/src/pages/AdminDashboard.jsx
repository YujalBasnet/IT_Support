import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
  total: 0,
  open: 0,
  inProgress: 0,
  resolved: 0,
});
 
const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("ALL");
const [priorityFilter, setPriorityFilter] = useState("ALL");
const [currentPage, setCurrentPage] = useState(1);
const [pagination, setPagination] = useState({
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 0,
});

const [teams, setTeams] = useState([]);
const [selectedTicket, setSelectedTicket] = useState(null);
const [selectedTeam, setSelectedTeam] = useState("");
const [teamMembers, setTeamMembers] = useState([]);
const [selectedAgent, setSelectedAgent] = useState("");
const [assigning, setAssigning] = useState(false);
const [assignError, setAssignError] = useState("");
const [assignSuccess, setAssignSuccess] = useState("");
useEffect(() => {
  const timer = setTimeout(() => {
    console.log("Debounced search term:", searchTerm);
    setDebouncedSearch(searchTerm);
  }, 900);

  return () => clearTimeout(timer);
}, [searchTerm]);

  
  useEffect(() => {
  setCurrentPage(1);
}, [debouncedSearch, statusFilter, priorityFilter]);
  useEffect(() => {
    const controller = new AbortController();
    const fetchTickets = async () => {
      // setLoading(true);
      setError("");
      try {
      
const { data } = await api.get("/tickets", {
  params: {
    page: currentPage,
    limit: 5,
    search: debouncedSearch || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    priority: priorityFilter === "ALL" ? undefined : priorityFilter,
  },
  signal: controller.signal,
});


        // const { data: statsData } = await api.get("/tickets/stats");
        // setStats(statsData);

        // Support common paginated response formats.
        const ticketList = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.tickets)
          ? data.tickets
          : null;

        if (!ticketList) {
          throw new Error("Unexpected tickets response format");
        }

        setTickets(ticketList);
setPagination(
  data.pagination || {
    page: currentPage,
    limit: 5,
    total: ticketList.length,
    totalPages: 1,
  }
);
      } catch (err) {
  if (err.code === "ERR_CANCELED") return;

  console.error("Failed to load tickets:", err);

  setError(
    err.response?.data?.message ||
    err.message ||
    "Failed to load tickets"
  );

  setTickets([]);
} finally {
  setLoading(false);
}
    };

    fetchTickets();

return () => {
  controller.abort();
};
}, [currentPage, debouncedSearch, statusFilter, priorityFilter]);





// NEW: Fetch dashboard statistics separately
useEffect(() => {
  const controller = new AbortController();

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/tickets/stats", {
        signal: controller.signal,
      });

      setStats(data);
    } catch (err) {
      if (err.code === "ERR_CANCELED") return;

      console.error("Failed to load ticket statistics:", err);
    }
  };

  fetchStats();

  return () => controller.abort();
}, []);






  const getStatusStyle = (status) => {
  const styles = {
    OPEN: "bg-blue-100 text-blue-700",
    ASSIGNED: "bg-purple-100 text-purple-700",
    IN_PROGRESS: "bg-amber-100 text-amber-700",
    WAITING_FOR_USER: "bg-orange-100 text-orange-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-slate-200 text-slate-700",
    REOPENED: "bg-red-100 text-red-700",
  };

  return styles[status] || "bg-gray-100 text-gray-700";
};

const getPriorityStyle = (priority) => {
  const styles = {
    LOW: "bg-slate-100 text-slate-700",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };

  return styles[priority] || "bg-gray-100 text-gray-700";
};

const filteredTickets = tickets;
  


useEffect(() => {
  const fetchTeams = async () => {
    try {
      const { data } = await api.get("/teams");
      setTeams(Array.isArray(data.teams) ? data.teams : []);
    } catch (err) {
      console.error("Failed to load teams:", err);
      setAssignError(
        err.response?.data?.message || "Failed to load support teams."
      );
    }
  };

  fetchTeams();
}, []);


const handleAssignTicket = async (e) => {
  e.preventDefault();

  if (!selectedTicket || !selectedTeam || !selectedAgent) {
    setAssignError("Please select a team and an agent.");
    return;
  }

  setAssigning(true);
  setAssignError("");
  setAssignSuccess("");

  try {
    await api.patch(`/tickets/${selectedTicket.id}/assign`, {
      assigned_agent_id: Number(selectedAgent),
      team_id: Number(selectedTeam),
    });

    setAssignSuccess(
      `Ticket ${selectedTicket.ticket_number} assigned successfully.`
    );

    setSelectedTicket(null);
    setSelectedTeam("");
    setSelectedAgent("");
    setTeamMembers([]);

    // Refresh the ticket list and statistics.
    const { data } = await api.get("/tickets", {
      params: {
        page: currentPage,
        limit: 5,
        search: debouncedSearch || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        priority: priorityFilter === "ALL" ? undefined : priorityFilter,
      },
    });

    const ticketList = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.tickets)
      ? data.tickets
      : Array.isArray(data)
      ? data
      : [];

    setTickets(ticketList);
    setPagination(
      data.pagination || {
        page: currentPage,
        limit: 5,
        total: ticketList.length,
        totalPages: 1,
      }
    );

    const { data: statsData } = await api.get("/tickets/stats");
    setStats(statsData);
  } catch (err) {
    console.error("Failed to assign ticket:", err);
    setAssignError(
      err.response?.data?.message || "Failed to assign ticket."
    );
  } finally {
    setAssigning(false);
  }
};


const handleTeamChange = async (e) => {
  const teamId = e.target.value;

  setSelectedTeam(teamId);
  setSelectedAgent("");
  setTeamMembers([]);
  setAssignError("");

  if (!teamId) return;

  try {
    const { data } = await api.get(`/teams/${teamId}/members`);

    // Supports common response shapes.
    const members = Array.isArray(data.members)
      ? data.members
      : Array.isArray(data.teamMembers)
      ? data.teamMembers
      : [];

    setTeamMembers(members);
  } catch (err) {
    console.error("Failed to load team members:", err);
    setAssignError(
      err.response?.data?.message || "Failed to load team members."
    );
  }
};



  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">
        Admin Dashboard
      </h1>

      <p className="mt-2 text-slate-500">
        Welcome to your IT Support management dashboard.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
  <div className="rounded-xl bg-white p-5 shadow">
    <p className="text-sm text-gray-500">Total Tickets</p>
    <h2 className="mt-2 text-3xl font-bold">{stats.total}</h2>
  </div>

  <div className="rounded-xl bg-white p-5 shadow">
    <p className="text-sm text-gray-500">Open Tickets</p>
    <h2 className="mt-2 text-3xl font-bold text-blue-600">
      {stats.open}
    </h2>
  </div>

  <div className="rounded-xl bg-white p-5 shadow">
    <p className="text-sm text-gray-500">In Progress</p>
    <h2 className="mt-2 text-3xl font-bold text-amber-600">
      {stats.inProgress}
    </h2>
  </div>

  <div className="rounded-xl bg-white p-5 shadow">
    <p className="text-sm text-gray-500">Resolved Tickets</p>
    <h2 className="mt-2 text-3xl font-bold text-green-600">
      {stats.resolved}
    </h2>
  </div>
</div>
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">


<div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
  <h2 className="text-xl font-semibold text-slate-900">
    Assign Ticket
  </h2>

  <p className="mt-1 text-sm text-slate-500">
    Select a ticket, support team, and team member.
  </p>

  {assignSuccess && (
    <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
      {assignSuccess}
    </p>
  )}

  {assignError && (
    <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {assignError}
    </p>
  )}

  <form
    onSubmit={handleAssignTicket}
    className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4"
  >
    <select
      value={selectedTicket?.id || ""}
      onChange={(e) => {
        const ticket = tickets.find(
          (item) => String(item.id) === e.target.value
        );

        setSelectedTicket(ticket || null);
        setAssignError("");
        setAssignSuccess("");
      }}
      className="rounded-lg border border-slate-300 px-3 py-2"
      required
    >
      <option value="">Select ticket</option>
      {tickets.map((ticket) => (
        <option key={ticket.id} value={ticket.id}>
          {ticket.ticket_number} — {ticket.title}
        </option>
      ))}
    </select>

    <select
      value={selectedTeam}
      onChange={handleTeamChange}
      className="rounded-lg border border-slate-300 px-3 py-2"
      required
    >
      <option value="">Select team</option>
      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </select>

    <select
      value={selectedAgent}
      onChange={(e) => setSelectedAgent(e.target.value)}
      className="rounded-lg border border-slate-300 px-3 py-2"
      required
      disabled={!selectedTeam || teamMembers.length === 0}
    >
      <option value="">Select support agent</option>
      {teamMembers.map((member) => {
        const agentId = member.user_id ?? member.id;
        const agentName =
          member.name ||
          member.full_name ||
          member.email ||
          `Agent ${agentId}`;

        return (
          <option key={agentId} value={agentId}>
            {agentName}
          </option>
        );
      })}
    </select>

    <button
      type="submit"
      disabled={assigning || !selectedTicket || !selectedTeam || !selectedAgent}
      className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {assigning ? "Assigning..." : "Assign Ticket"}
    </button>
  </form>
</div>
   
<div className="mb-5">
  <h2 className="text-xl font-semibold">
    Recent Tickets
  </h2>

  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
    {/* Search */}
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search ticket number or title..."
      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />

    {/* Status filter */}
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
    >
      <option value="ALL">All statuses</option>
      <option value="OPEN">Open</option>
      <option value="ASSIGNED">Assigned</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="WAITING_FOR_USER">Waiting for User</option>
      <option value="RESOLVED">Resolved</option>
      <option value="CLOSED">Closed</option>
      <option value="REOPENED">Reopened</option>
    </select>

    {/* Priority filter */}
    <select
      value={priorityFilter}
      onChange={(e) => setPriorityFilter(e.target.value)}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
    >
      <option value="ALL">All priorities</option>
      <option value="LOW">Low</option>
      <option value="MEDIUM">Medium</option>
      <option value="HIGH">High</option>
      <option value="URGENT">Urgent</option>
    </select>
  </div>

  <div className="mt-3 flex items-center justify-between">
    <p className="text-sm text-slate-500">
      Showing {tickets.length} of {pagination.total} tickets
    </p>

    <button
      type="button"
      onClick={() => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setPriorityFilter("ALL");
      }}
      className="text-sm font-medium text-blue-600 hover:underline"
    >
      Clear filters
    </button>
  </div>
</div>


        {loading ? (
          <p>Loading tickets...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : tickets.length === 0 ? (
          <p className="text-slate-500">No tickets found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-slate-500 text-sm">
                    <th className="py-3">Ticket Number</th>
                    <th className="py-3">Title</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Priority</th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No tickets match your search or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 font-medium text-blue-600">
                          {ticket.ticket_number}
                        </td>

                        <td className="py-4 text-slate-800">{ticket.title}</td>

                        <td className="py-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              ticket.status
                            )}`}
                          >
                            {(ticket.status || "").replace(/_/g, " ")}
                          </span>
                        </td>

                        <td className="py-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getPriorityStyle(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
                {" · "}
                {pagination.total} total tickets
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    loading ||
                    pagination.totalPages === 0 ||
                    currentPage >= pagination.totalPages
                  }
                  onClick={() => setCurrentPage((page) => page + 1)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
