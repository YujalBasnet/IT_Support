import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Ticket,
  Users2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  FileText,
  Building,
  KeyRound,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      // Dual mounted endpoint: /api/auth/me or /auth/me
      const res = await api.get("/auth/me");
      setProfileData(res.data);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load user profile. Please verify your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const user = profileData?.user;
  const stats = profileData?.stats;
  const roleId = Number(user?.role_id);

  const roleMeta = {
    1: {
      title: "Employee",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      badge: "bg-blue-600 text-white",
      dashPath: "/employee",
      dashLabel: "My Tickets",
      desc: "Standard user account with ticket submission and monitoring capabilities.",
    },
    2: {
      title: "Support Agent",
      color: "bg-purple-50 text-purple-700 border-purple-200",
      badge: "bg-purple-600 text-white",
      dashPath: "/agent",
      dashLabel: "Support Queue",
      desc: "Tier support specialist assigned to resolve technical issues and maintain SLAs.",
    },
    3: {
      title: "Administrator",
      color: "bg-rose-50 text-rose-700 border-rose-200",
      badge: "bg-rose-600 text-white",
      dashPath: "/admin",
      dashLabel: "Admin Hub",
      desc: "Full administrative access to all tickets, users, teams, categories, and audit logs.",
    },
  };

  const currentRole = roleMeta[roleId] || {
    title: user?.role || "User",
    color: "bg-slate-50 text-slate-700 border-slate-200",
    badge: "bg-slate-600 text-white",
    dashPath: "/",
    dashLabel: "Dashboard",
    desc: "System user.",
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-44 bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-200" />
          <div className="space-y-3 flex-1">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-1/6" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-28 bg-white rounded-2xl border border-slate-200" />
          <div className="h-28 bg-white rounded-2xl border border-slate-200" />
          <div className="h-28 bg-white rounded-2xl border border-slate-200" />
        </div>
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl p-8 border border-red-200 text-center shadow-sm">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={30} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Profile</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={fetchProfile}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User Profile
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your personal credentials, system role, and support statistics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProfile}
            title="Refresh profile details"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <Link
            to={currentRole.dashPath}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-xs"
          >
            {currentRole.dashLabel}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <div className="px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 mb-6">
            <div className="flex items-end gap-5">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.name}
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-3xl flex items-center justify-center border-4 border-white shadow-md">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <div className="mb-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {user?.name || "User"}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${currentRole.badge}`}
                  >
                    <ShieldCheck size={14} />
                    {currentRole.title}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {user?.account_status || "ACTIVE"}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <Mail size={15} className="text-slate-400" />
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 self-start sm:self-auto flex items-center gap-2">
              <Calendar size={15} className="text-slate-400" />
              <span>Joined: <strong className="text-slate-700 font-semibold">{formatDate(user?.created_at)}</strong></span>
            </div>
          </div>

          <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100">
            {currentRole.desc}
          </p>
        </div>
      </div>

      {/* Statistics Section (Employee or Agent stats) */}
      {roleId === 1 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Ticket Activity Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Ticket size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Submitted</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {stats?.totalTickets ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Awaiting Support</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {stats?.openTickets ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <RefreshCw size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">In Progress</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {stats?.inProgressTickets ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Resolved / Closed</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {(stats?.resolvedTickets ?? 0) + (stats?.closedTickets ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {roleId === 2 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Agent Performance & Queue
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Ticket size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Assigned to Me</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {stats?.assignedTickets ?? stats?.totalTickets ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Currently In Progress</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {stats?.inProgressTickets ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Successfully Resolved</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {stats?.resolvedTickets ?? 0}
                </p>
              </div>
            </div>
          </div>

          {stats?.teams && stats.teams.length > 0 && (
            <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users2 size={16} className="text-purple-600" />
                Support Team Memberships
              </h4>
              <div className="flex flex-wrap gap-2">
                {stats.teams.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    <Building size={13} />
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Details & Metadata Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <KeyRound size={18} className="text-slate-600" />
          Account & Security Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Full Legal Name
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 flex items-center gap-2.5">
              <User size={16} className="text-slate-400" />
              {user?.name || "Not provided"}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 flex items-center gap-2.5">
              <Mail size={16} className="text-slate-400" />
              {user?.email || "Not provided"}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Assigned Role
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-blue-600" />
                {currentRole.title}
              </span>
              <span className="text-xs text-slate-500 font-normal">
                Role ID: #{user?.role_id}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Account Status
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                {user?.account_status || "ACTIVE"}
              </span>
              <span className="text-xs text-emerald-600 font-medium">Verified</span>
            </div>
          </div>
        </div>

        {/* Security / Helpdesk Note */}
        <div className="rounded-xl p-4 bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
          <FileText size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Security Note:</span> To update your official full name or work email address, please contact your IT Administrator or submit an account modification ticket through the service portal.
          </div>
        </div>
      </div>
    </div>
  );
}
