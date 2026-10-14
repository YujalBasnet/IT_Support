import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Users2, Tag, ArrowRight } from "lucide-react";
import api from "../services/api";

export default function AdminDashboard() {
  
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

const [assignmentTickets, setAssignmentTickets] = useState([]);
const [assignmentSearch, setAssignmentSearch] = useState("");
const [debouncedAssignmentSearch, setDebouncedAssignmentSearch] = useState("");
const [assignmentLoading, setAssignmentLoading] = useState(false);

const [assignmentPage, setAssignmentPage] = useState(1);

const [assignmentPagination, setAssignmentPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});


const [selectedTicket, setSelectedTicket] = useState(null);
const [selectedTeam, setSelectedTeam] = useState("");
const [teamMembers, setTeamMembers] = useState([]);
const [selectedAgent, setSelectedAgent] = useState("");
const [assigning, setAssigning] = useState(false);
const [assignError, setAssignError] = useState("");
const [assignSuccess, setAssignSuccess] = useState("");
const [searching, setSearching] = useState(false);
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
      setSearching(true);
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
  if(!controller.signal.aborted){
    setSearching(false);
    setLoading(false);
  }
 
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


useEffect(() => {
  const timer = setTimeout(() => {
    setAssignmentPage(1);
    setDebouncedAssignmentSearch(assignmentSearch.trim());
  }, 500);

  return () => clearTimeout(timer);
}, [assignmentSearch]);


useEffect(() => {
  const controller = new AbortController();

  const fetchAssignmentTickets = async () => {
    setAssignmentLoading(true);

    try {
      const { data } = await api.get("/tickets", {
        params: {
          page: 1,
          limit: 10,
          search: debouncedAssignmentSearch || undefined,
        },
        signal: controller.signal,
      });

      const ticketList = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.tickets)
        ? data.tickets
        : Array.isArray(data)
        ? data
        : [];

      setAssignmentTickets(ticketList);
    } catch (err) {
      if (err.code === "ERR_CANCELED") return;

      console.error("Failed to load assignment tickets:", err);
      setAssignmentTickets([]);
    } finally {
      if (!controller.signal.aborted) {
        setAssignmentLoading(false);
      }
    }
  };

  fetchAssignmentTickets();

  return () => controller.abort();
}, [debouncedAssignmentSearch]);



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
      
<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <p className="mb-1 text-sm font-medium text-blue-600">
      IT SUPPORT MANAGEMENT
    </p>

    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
      Admin Dashboard
    </h1>

    <p className="mt-2 text-sm text-slate-500">
      Monitor support tickets, manage assignments, and track team performance.
    </p>
  </div>

  <div className="flex items-center gap-2">
    <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
      <span className="h-2 w-2 rounded-full bg-green-500" />
      Admin Workspace
    </span>
  </div>
</div>


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
      {/* Management Modules Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <div
          onClick={() => navigate("/admin/users")}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-rose-300 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-100 transition">
              <Users size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">User Directory</h3>
              <p className="text-xs text-slate-500">Manage user roles & access</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-slate-300 group-hover:text-rose-600 transition" />
        </div>

        <div
          onClick={() => navigate("/admin/teams")}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-purple-300 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition">
              <Users2 size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Support Teams</h3>
              <p className="text-xs text-slate-500">Organize agent rosters</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-slate-300 group-hover:text-purple-600 transition" />
        </div>

        <div
          onClick={() => navigate("/admin/categories")}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition">
              <Tag size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Ticket Categories</h3>
              <p className="text-xs text-slate-500">Add or disable categories</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition" />
        </div>
      </div>

      {/* Assign Ticket Card */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Assign Ticket
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select a ticket, support team, and team member.
        </p>
  
<div className="mt-4">
  <label
    htmlFor="assignment-ticket-search"
    className="mb-2 block text-sm font-medium text-slate-700"
  >
    Search ticket for assignment
  </label>

  <input
    id="assignment-ticket-search"
    type="text"
    value={assignmentSearch}
    onChange={(e) => setAssignmentSearch(e.target.value)}
    placeholder="Enter ticket number or title..."
    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
  />

  {assignmentLoading && (
    <p className="mt-2 text-sm text-blue-600">
      Searching tickets...
    </p>
  )}
</div>


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
        const ticket = assignmentTickets.find(
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
      {assignmentTickets.map((ticket) => (
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
   
{/* Ticket Queue Section */}
<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  <div className="mb-5">
  {searching && (
  <p className="mt-2 text-sm text-blue-600">
    Searching tickets...
  </p>
)}

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
  <div className="py-10 text-center">
    <p className="font-medium text-slate-700">
      {debouncedSearch ||
      statusFilter !== "ALL" ||
      priorityFilter !== "ALL"
        ? "No tickets match your search or filters."
        : "No tickets have been created yet."}
    </p>

    <p className="mt-2 text-sm text-slate-500">
      {debouncedSearch ||
      statusFilter !== "ALL" ||
      priorityFilter !== "ALL"
        ? "Try changing your search or clearing the filters."
        : "New tickets will appear here once employees submit them."}
    </p>
  </div>
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
