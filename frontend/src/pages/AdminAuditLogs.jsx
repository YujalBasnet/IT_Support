import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  Clock,
  Shield,
  Activity,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import api from "../services/api";

// In-memory cache for instant navigation without loading flashes
let cachedAuditLogs = null;
let cachedAuditPagination = null;

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState(() => cachedAuditLogs || []);
  const [loading, setLoading] = useState(() => !cachedAuditLogs);
  const [error, setError] = useState("");

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const limit = 15;

  const fetchAuditLogs = async (currentPage = page, isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError("");

    try {
      const params = {
        page: currentPage,
        limit,
      };

      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource_type = resourceFilter;

      const { data } = await api.get("/audit-logs", { params });

      const logList = Array.isArray(data.data) ? data.data : [];
      cachedAuditLogs = logList;
      setLogs(logList);
      if (data.pagination) {
        cachedAuditPagination = data.pagination;
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.total || 0);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError(err.response?.data?.message || "Failed to load system audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(1);
  }, [actionFilter, resourceFilter]);

  // Client-side text search filter across actor and action details
  const filteredLogs = logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const actorName = log.actor_name?.toLowerCase() || "";
    const actorEmail = log.actor_email?.toLowerCase() || "";
    const action = log.action?.toLowerCase() || "";
    const resource = log.resource_type?.toLowerCase() || "";
    const changes = JSON.stringify(log.changes || "").toLowerCase();

    return (
      actorName.includes(term) ||
      actorEmail.includes(term) ||
      action.includes(term) ||
      resource.includes(term) ||
      changes.includes(term)
    );
  });

  const getActionBadgeColor = (action) => {
    if (action.includes("ROLE")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (action.includes("DISABLED") || action.includes("DELETED"))
      return "bg-rose-100 text-rose-700 border-rose-200";
    if (action.includes("ACTIVATED") || action.includes("CREATED"))
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (action.includes("ASSIGNED") || action.includes("TICKET"))
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (action.includes("TEAM")) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const formatChanges = (changes) => {
    if (!changes) return <span className="text-slate-400 italic">No details</span>;

    let parsed = changes;
    if (typeof changes === "string") {
      try {
        parsed = JSON.parse(changes);
      } catch {
        return <span className="text-xs text-slate-600">{changes}</span>;
      }
    }

    return (
      <div className="space-y-1">
        {Object.entries(parsed).map(([key, value]) => (
          <div key={key} className="text-xs">
            <span className="font-semibold text-slate-700">{key}: </span>
            <span className="text-slate-600 font-mono">
              {typeof value === "object" && value !== null
                ? JSON.stringify(value)
                : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="text-indigo-600" size={28} />
            System Audit Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable administrative event trail, security changes, and system access history.
          </p>
        </div>

        <button
          onClick={() => fetchAuditLogs(page)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Recorded Events
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current Page Records
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {filteredLogs.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Audit Status
            </p>
            <p className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active & Protected
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by actor, email, action, or change content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <div className="relative">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Actions</option>
              <option value="USER_ROLE_CHANGED">User Role Changed</option>
              <option value="USER_ACCOUNT_DISABLED">User Account Disabled</option>
              <option value="USER_ACCOUNT_ACTIVATED">User Account Activated</option>
              <option value="TICKET_ASSIGNED">Ticket Assigned / Reassigned</option>
              <option value="SUPPORT_TEAM_CREATED">Support Team Created</option>
              <option value="SUPPORT_TEAM_UPDATED">Support Team Updated</option>
              <option value="TEAM_MEMBER_ADDED">Team Member Added</option>
              <option value="TEAM_MEMBER_REMOVED">Team Member Removed</option>
              <option value="CATEGORY_CREATED">Category Created</option>
              <option value="CATEGORY_UPDATED">Category Updated</option>
              <option value="CATEGORY_DELETED">Category Deleted</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Resources</option>
              <option value="USER">User</option>
              <option value="TICKET">Ticket</option>
              <option value="SUPPORT_TEAM">Support Team</option>
              <option value="CATEGORY">Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <Clock size={32} className="animate-spin mx-auto text-indigo-600 mb-3" />
            <p className="text-sm font-medium">Loading audit history...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-sm">{error}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-base font-semibold text-slate-700">No audit logs found</p>
            <p className="text-xs text-slate-400 mt-1">
              Events will appear as administrative actions are performed in the system.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Actor</th>
                  <th className="py-3.5 px-6">Action</th>
                  <th className="py-3.5 px-6">Resource</th>
                  <th className="py-3.5 px-6">Details / Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    {/* Timestamp */}
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-500">
                      <div className="font-semibold text-slate-800">
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {log.actor_name ? log.actor_name.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            {log.actor_name || "System"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {log.actor_email || `ID: #${log.user_id || "N/A"}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Resource */}
                    <td className="py-4 px-6 whitespace-nowrap text-xs">
                      <span className="font-semibold text-slate-800">
                        {log.resource_type}
                      </span>
                      {log.resource_id && (
                        <span className="text-slate-400 font-mono ml-1">
                          #{log.resource_id}
                        </span>
                      )}
                    </td>

                    {/* Changes */}
                    <td className="py-4 px-6">
                      <div className="max-w-md bg-slate-50 border border-slate-200/70 p-2.5 rounded-lg">
                        {formatChanges(log.changes)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            Showing page <span className="font-bold text-slate-800">{page}</span> of{" "}
            <span className="font-bold text-slate-800">{totalPages}</span> ({totalCount}{" "}
            total events)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAuditLogs(page - 1)}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <span className="text-xs font-semibold px-2 text-slate-600">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => fetchAuditLogs(page + 1)}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
