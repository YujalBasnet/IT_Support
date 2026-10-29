import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  RefreshCw,
  FileText,
} from "lucide-react";
import api from "../services/api";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  // Current user info
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  // Ticket listing state
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

  // Modal & Form state for creating ticket
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    priority: "MEDIUM",
  });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter]);

  // Fetch categories for ticket creation
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");
        const list = Array.isArray(data.categories)
          ? data.categories.filter((c) => Number(c.is_active) === 1)
          : [];
        setCategories(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: String(list[0].id) }));
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch tickets for this employee
  const fetchTickets = async () => {
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
      console.error("Failed to load employee tickets:", err);
      setError(
        err.response?.data?.message || "Failed to load support tickets."
      );
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentPage, debouncedSearch, statusFilter, priorityFilter]);

  // Handle create ticket submit
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!formData.title.trim() || !formData.description.trim()) {
      setSubmitError("Please provide both a title and description.");
      return;
    }

    if (!formData.category_id) {
      setSubmitError("Please select a category.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create ticket
      const { data: ticketRes } = await api.post("/tickets", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_id: Number(formData.category_id),
        priority: formData.priority,
      });

      const newTicketId = ticketRes?.ticket?.id || ticketRes?.id;

      // 2. Upload attachment if attached
      if (attachmentFile && newTicketId) {
        const fileData = new FormData();
        fileData.append("file", attachmentFile);

        await api.post(`/attachments/tickets/${newTicketId}/attachments`, fileData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSubmitSuccess("Ticket created successfully!");
      // Reset form
      setFormData({
        title: "",
        description: "",
        category_id: categories.length > 0 ? String(categories[0].id) : "",
        priority: "MEDIUM",
      });
      setAttachmentFile(null);

      // Refresh tickets list
      fetchTickets();

      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess("");
      }, 1200);
    } catch (err) {
      console.error("Ticket creation error:", err);
      setSubmitError(
        err.response?.data?.message || "Failed to create ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
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

  // Stats computation from loaded tickets
  const totalTickets = pagination.total || tickets.length;
  const openCount = tickets.filter(
    (t) => t.status === "OPEN" || t.status === "ASSIGNED"
  ).length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "WAITING_FOR_USER"
  ).length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600 uppercase tracking-wide">
            Employee Portal
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome, {user?.name || "Employee"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Submit IT support requests and track the real-time resolution status of your tickets.
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
          >
            <Plus size={20} />
            Create Ticket
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TicketIcon size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">My Tickets</p>
            <h2 className="text-2xl font-bold text-slate-900">{totalTickets}</h2>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Open / Assigned</p>
            <h2 className="text-2xl font-bold text-purple-600">{openCount}</h2>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">In Progress</p>
            <h2 className="text-2xl font-bold text-amber-600">{inProgressCount}</h2>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Resolved</p>
            <h2 className="text-2xl font-bold text-green-600">{resolvedCount}</h2>
          </div>
        </div>
      </div>

      {/* Tickets List Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Support Tickets</h2>
            <p className="text-xs text-slate-500">
              Click any ticket to review comments, download attachments, and check progress.
            </p>
          </div>

          <button
            onClick={fetchTickets}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-medium transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
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
              className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-sm"
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
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm">Loading your tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <TicketIcon size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700">No tickets found</p>
            <p className="text-sm text-slate-500 mt-1">
              {debouncedSearch || statusFilter !== "ALL" || priorityFilter !== "ALL"
                ? "No tickets match your filter criteria."
                : "You haven't submitted any IT support tickets yet."}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              <Plus size={16} />
              Submit your first ticket
            </button>
          </div>
        ) : (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-3 px-2">Ticket #</th>
                    <th className="py-3 px-2">Title</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Priority</th>
                    <th className="py-3 px-2">Submitted On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3.5 px-2 font-semibold text-blue-600">
                        {ticket.ticket_number}
                      </td>
                      <td className="py-3.5 px-2 font-medium text-slate-800 max-w-xs truncate">
                        {ticket.title}
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
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPriorityStyle(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-slate-500">
                        {ticket.created_at
                          ? new Date(ticket.created_at).toLocaleDateString()
                          : "—"}
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
                {pagination.total} total tickets)
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

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <FileText size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Submit IT Support Request
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              {submitSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  {submitSuccess}
                </div>
              )}

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={18} />
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Ticket Title *
                </label>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Cannot connect to office VPN"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category_id: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, priority: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe your issue in detail (error messages, troubleshooting steps taken)..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Attach File (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition">
                    <Upload size={16} />
                    <span>{attachmentFile ? attachmentFile.name : "Choose File"}</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachmentFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>

                  {attachmentFile && (
                    <button
                      type="button"
                      onClick={() => setAttachmentFile(null)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Max file size: 10MB (images, PDF, documents)
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}