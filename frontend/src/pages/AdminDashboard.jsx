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
const [statusFilter, setStatusFilter] = useState("ALL");
const [priorityFilter, setPriorityFilter] = useState("ALL");

  

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get("/tickets", {
          params: { page: 1, limit: 5 },
        });

        const { data: statsData } = await api.get("/tickets/stats");
        setStats(statsData);

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
      } catch (err) {
        console.error("Failed to load tickets:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load tickets"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
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

const filteredTickets = tickets.filter((ticket) => {
  const search = searchTerm.trim().toLowerCase();

  const matchesSearch =
    (ticket.ticket_number || "").toLowerCase().includes(search) ||
    (ticket.title || "").toLowerCase().includes(search);

  const matchesStatus =
    statusFilter === "ALL" || ticket.status === statusFilter;

  const matchesPriority =
    priorityFilter === "ALL" || ticket.priority === priorityFilter;

  return matchesSearch && matchesStatus && matchesPriority;
});


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
      Showing {filteredTickets.length} of {tickets.length} loaded tickets
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
          <p className="text-slate-500">
            No tickets found.
          </p>
        ) : (
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
  {filteredTickets.map((ticket) => (
    <tr
      key={ticket.id}
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className="border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
    >
      <td className="py-4 font-medium text-blue-600">
        {ticket.ticket_number}
      </td>

      <td className="py-4 text-slate-800">
        {ticket.title}
      </td>

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
  ))}
</tbody>


            </table>
          </div>
        )}
      </div>
    </div>
  );
}
