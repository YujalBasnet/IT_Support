import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  UserCheck,
} from "lucide-react";
import api from "../services/api";

export default function AgentDashboard() {
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter]);

  // Fetch tickets assigned to this agent
  const fetchAssignedTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/tickets", {
        params: {
          page: currentPage,
          limit: 10,
          search: debouncedSearch || undefined,
          status: statusFilter === "ALL" ? undefined : statusFilter,
          priority: priorityFilter === "ALL" ? undefined : priorityFilter,
          sortBy: "createdAt",
          sortOrder: "desc",
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
          limit: 10,
          total: ticketList.length,
          totalPages: Math.ceil(ticketList.length / 10) || 1,
        }
      );
    } catch (err) {
      console.error("Failed to load agent tickets:", err);
      setError(
        err.response?.data?.message || "Failed to load assigned support tickets."
      );
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTickets();
  }, [currentPage, debouncedSearch, statusFilter, priorityFilter]);

  // Handle quick status update directly from table if needed
  const handleQuickStatusChange = async (ticketId, newStatus) => {
    try {
      await api.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      fetchAssignedTickets();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update ticket status.");
    }
  };

  // Badge styles
  const getStatusStyle = (status) => {
    const styles = {
      OPEN: "bg-blue-100 text-blue-700 border-blue-200",
      ASSIGNED: "bg-purple-100 text-purple-700 border-purple-200",
      IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
      WAITING_FOR_USER: "bg-orange-100 text-orange-700 border-orange-200",
      RESOLVED: "bg-green-100 text-green-700 border-green-200",
      CLOSED: "bg-slate-200 text-slate-700 border-slate-300",
      REOPENED: "bg-red-100 text-red-700 border-red-200",
    };

    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      LOW: "bg-slate-100 text-slate-700",
      MEDIUM: "bg-blue-100 text-blue-700",
      HIGH: "bg-orange-100 text-orange-700",
      URGENT: "bg-red-100 text-red-700 font-semibold",
    };

    return styles[priority] || "bg-gray-100 text-gray-700";
  };

  // Stats computation
  const totalAssigned = pagination.total || tickets.length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const waitingCount = tickets.filter((t) => t.status === "WAITING_FOR_USER").length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-purple-600 uppercase tracking-wide">
            Support Agent Desk
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome, {user?.name || "Agent"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review tickets assigned to you, reply with internal or public notes, and update ticket statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            Support Agent Active
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Assigned To Me</p>
            <h2 className="text-2xl font-bold text-slate-900">{totalAssigned}</h2>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">In Progress</p>
            <h2 className="text-2xl font-bold text-amber-600">{inProgressCount}</h2>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Waiting For User</p>
            <h2 className="text-2xl font-bold text-orange-600">{waitingCount}</h2>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Resolved / Closed</p>
            <h2 className="text-2xl font-bold text-green-600">{resolvedCount}</h2>
          </div>
        </div>
      </div>

      {/* Assigned Tickets Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Assigned Queue</h2>
            <p className="text-xs text-slate-500">
              Tickets currently assigned to your queue for investigation and resolution.
            </p>
          </div>

          <button
            onClick={fetchAssignedTickets}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-purple-600 font-medium transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Queue
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ticket # or title..."
              className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-purple-500 text-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_USER">Waiting for User</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-purple-500 text-sm"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Table Content */}
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-purple-600" />
            <p className="text-sm">Loading assigned tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <TicketIcon size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700">No tickets in your queue</p>
            <p className="text-sm text-slate-500 mt-1">
              {debouncedSearch || statusFilter !== "ALL" || priorityFilter !== "ALL"
                ? "No assigned tickets match the search or filter criteria."
                : "You currently have no support tickets assigned to you."}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-3 px-2">Ticket #</th>
                    <th className="py-3 px-2">Title</th>
                    <th className="py-3 px-2">Priority</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Quick Action</th>
                    <th className="py-3 px-2 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="py-3.5 px-2 font-semibold text-purple-600 cursor-pointer"
                      >
                        {ticket.ticket_number}
                      </td>
                      <td
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="py-3.5 px-2 font-medium text-slate-800 max-w-xs truncate cursor-pointer"
                      >
                        {ticket.title}
                      </td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPriorityStyle(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getStatusStyle(
                            ticket.status
                          )}`}
                        >
                          {(ticket.status || "").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        {ticket.status === "ASSIGNED" && (
                          <button
                            onClick={() =>
                              handleQuickStatusChange(ticket.id, "IN_PROGRESS")
                            }
                            className="text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded px-2.5 py-1 font-medium transition cursor-pointer"
                          >
                            Start Work
                          </button>
                        )}
                        {ticket.status === "IN_PROGRESS" && (
                          <button
                            onClick={() =>
                              handleQuickStatusChange(ticket.id, "RESOLVED")
                            }
                            className="text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded px-2.5 py-1 font-medium transition cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                        {ticket.status === "WAITING_FOR_USER" && (
                          <button
                            onClick={() =>
                              handleQuickStatusChange(ticket.id, "IN_PROGRESS")
                            }
                            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded px-2.5 py-1 font-medium transition cursor-pointer"
                          >
                            Resume Work
                          </button>
                        )}
                        {["RESOLVED", "CLOSED"].includes(ticket.status) && (
                          <span className="text-xs text-slate-400">Completed</span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 transition cursor-pointer"
                        >
                          View <ExternalLink size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of {Math.max(pagination.totalPages, 1)} (
                {pagination.total} assigned tickets)
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
