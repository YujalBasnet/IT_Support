import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Filter,
} from "lucide-react";
import api from "../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Role edit modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [updatingRole, setUpdatingRole] = useState(false);

  // Status update state
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Current logged in user
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    currentUser = null;
  }

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/users");
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.response?.data?.message || "Failed to load system users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newRole) return;

    if (
      Number(selectedUser.id) === Number(currentUser?.id) &&
      newRole !== "ADMIN"
    ) {
      if (
        !window.confirm(
          "Warning: You are about to change your own role from ADMIN. You will lose access to the Admin panel. Do you wish to continue?"
        )
      ) {
        return;
      }
    }

    setUpdatingRole(true);
    setMessage({ type: "", text: "" });

    try {
      await api.patch(`/users/${selectedUser.id}/role`, { role: newRole });
      setMessage({
        type: "success",
        text: `Role for ${selectedUser.name} updated to ${newRole.replace(/_/g, " ")}.`,
      });
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user role:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update user role.",
      });
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleStatusToggle = async (user) => {
    const nextStatus = user.account_status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const confirmMsg =
      nextStatus === "INACTIVE"
        ? `Are you sure you want to deactivate ${user.name}? They will not be able to log in.`
        : `Activate ${user.name}'s account?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdatingStatusId(user.id);
    setMessage({ type: "", text: "" });

    try {
      await api.patch(`/users/${user.id}/status`, { status: nextStatus });
      setMessage({
        type: "success",
        text: `Account for ${user.name} is now ${nextStatus.toLowerCase()}.`,
      });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user status:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update account status.",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchTerm ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "ALL" || u.account_status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Role badge styles
  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "SUPPORT_AGENT":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "EMPLOYEE":
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  // Stats calculation
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.account_status === "ACTIVE").length;
  const agentCount = users.filter((u) => u.role === "SUPPORT_AGENT").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-rose-600">
            System Administration
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View registered users, assign roles (Employee, Support Agent, Admin), and manage account statuses.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Message Banner */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Total Users</p>
            <h2 className="text-2xl font-bold text-slate-900">{totalCount}</h2>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-green-50 p-3 text-green-600">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Active Accounts</p>
            <h2 className="text-2xl font-bold text-green-600">{activeCount}</h2>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Support Agents</p>
            <h2 className="text-2xl font-bold text-purple-600">{agentCount}</h2>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Administrators</p>
            <h2 className="text-2xl font-bold text-rose-600">{adminCount}</h2>
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Filters bar */}
        <div className="flex flex-col md:flex-row gap-3 pb-6 border-b border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user name or email..."
              className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-rose-500 bg-white"
              >
                <option value="ALL">All Roles</option>
                <option value="EMPLOYEE">Employees</option>
                <option value="SUPPORT_AGENT">Support Agents</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-rose-500 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="my-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw size={28} className="animate-spin mx-auto text-rose-600 mb-2" />
            <p className="text-sm font-medium">Loading user directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Users size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No users found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search or role filters.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isCurrent = Number(u.id) === Number(currentUser?.id);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          {u.profile_image ? (
                            <img
                              src={u.profile_image}
                              alt={u.name}
                              className="h-9 w-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                              {u.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">
                              {u.name} {isCurrent && <span className="text-xs text-rose-500 font-normal">(You)</span>}
                            </p>
                            <p className="text-xs text-slate-400">ID: #{u.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-xs text-slate-600">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getRoleBadge(
                            u.role
                          )}`}
                        >
                          {u.role?.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.account_status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.account_status === "ACTIVE" ? "bg-green-500" : "bg-slate-400"
                            }`}
                          />
                          {u.account_status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setNewRole(u.role);
                            }}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            Change Role
                          </button>

                          <button
                            disabled={updatingStatusId === u.id || isCurrent}
                            onClick={() => handleStatusToggle(u)}
                            title={isCurrent ? "Cannot deactivate yourself" : ""}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                              u.account_status === "ACTIVE"
                                ? "border border-red-200 text-red-600 hover:bg-red-50"
                                : "border border-green-200 text-green-700 hover:bg-green-50"
                            }`}
                          >
                            {updatingStatusId === u.id
                              ? "Updating..."
                              : u.account_status === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Role Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                Update User Role
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRoleChange} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-600">
                  Modifying role permissions for{" "}
                  <span className="font-bold text-slate-900">{selectedUser.name}</span>{" "}
                  ({selectedUser.email}).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Role
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: "EMPLOYEE",
                      name: "Employee",
                      desc: "Can submit and track their own IT tickets.",
                    },
                    {
                      id: "SUPPORT_AGENT",
                      name: "Support Agent",
                      desc: "Can be assigned tickets, resolve issues, and post internal staff notes.",
                    },
                    {
                      id: "ADMIN",
                      name: "Administrator",
                      desc: "Full system access to tickets, team management, and user roles.",
                    },
                  ].map((roleOption) => (
                    <label
                      key={roleOption.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        newRole === roleOption.id
                          ? "border-rose-500 bg-rose-50/50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={roleOption.id}
                        checked={newRole === roleOption.id}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="mt-1 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {roleOption.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {roleOption.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  disabled={updatingRole}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingRole || newRole === selectedUser.role}
                  className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition disabled:opacity-50"
                >
                  {updatingRole ? "Saving..." : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
