
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data } = await api.get(`/tickets/${id}`);
        setTicket(data.ticket ?? data.data ?? data);
      } catch (err) {
        console.error("Failed to load ticket:", err);
        setError(
          err.response?.data?.message || "Failed to load ticket details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) {
    return <p className="p-6">Loading ticket details...</p>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!ticket) {
    return <p className="p-6">Ticket not found.</p>;
  }

  const fields = [
    ["Ticket Number", ticket.ticket_number],
    ["Title", ticket.title],
    ["Description", ticket.description],
    ["Status", ticket.status?.replace(/_/g, " ")],
    ["Priority", ticket.priority],
    ["Created At", ticket.created_at
      ? new Date(ticket.created_at).toLocaleString()
      : "—"],
    ["Updated At", ticket.updated_at
      ? new Date(ticket.updated_at).toLocaleString()
      : "—"],
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 text-sm font-medium text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Ticket Details
        </h1>

        <div className="mt-6 space-y-5">
          {fields.map(([label, value]) => (
            <div key={label}>
              <p className="text-sm font-medium text-slate-500">
                {label}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-slate-900">
                {value || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
