
import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
  total: 0,
  open: 0,
  inProgress: 0,
  resolved: 0,
});

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
        <h2 className="text-xl font-semibold mb-4">
          Recent Tickets
        </h2>

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
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-slate-100"
                  >
                    <td className="py-4">
                      {ticket.ticket_number}
                    </td>
                    <td className="py-4">
                      {ticket.title}
                    </td>
                    <td className="py-4">
                      {ticket.status}
                    </td>
                    <td className="py-4">
                      {ticket.priority}
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
