import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Headphones,
  LayoutDashboard,
  Users,
  Users2,
  Tag,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  CheckCheck,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notifRef = useRef(null);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const roleId = Number(user?.role_id);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoadingNotifications(true);
      const res = await api.get("/notifications?limit=20");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // silent
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsOpen]);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await api.patch(`/notifications/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: 1 } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // silent
      }
    }
    setNotificationsOpen(false);
    if (notif.ticket_id) {
      navigate(`/tickets/${notif.ticket_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffMin / 60 / 24);
    return `${diffDays}d ago`;
  };

  const dashboardPaths = {
    1: "/employee",
    2: "/agent",
    3: "/admin",
  };

  const dashboardPath = dashboardPaths[roleId] || "/login";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const roleMeta = {
    1: {
      label: "Employee",
      pill: "bg-blue-900/60 text-blue-300 border-blue-700/60",
      dashLabel: "My Tickets",
    },
    2: {
      label: "Support Agent",
      pill: "bg-purple-900/60 text-purple-300 border-purple-700/60",
      dashLabel: "Assigned Queue",
    },
    3: {
      label: "Administrator",
      pill: "bg-rose-900/60 text-rose-300 border-rose-700/60",
      dashLabel: "Tickets Hub",
    },
  };

  const currentRole = roleMeta[roleId] || {
    label: "User",
    pill: "bg-slate-800 text-slate-300 border-slate-700",
    dashLabel: "Dashboard",
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white shadow-xs font-semibold"
        : "text-slate-300 hover:text-white hover:bg-slate-800"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white font-semibold"
        : "text-slate-300 hover:text-white hover:bg-slate-800"
    }`;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link
            to={dashboardPath}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-500 transition">
              <Headphones size={22} />
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight block leading-tight">
                IT Support
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Service Desk
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 ml-6 overflow-x-auto py-1 scrollbar-none">
            <NavLink to={dashboardPath} end className={navLinkClass}>
              <LayoutDashboard size={18} />
              <span>{currentRole.dashLabel}</span>
            </NavLink>

            {roleId === 3 && (
              <>
                <NavLink to="/admin/users" className={navLinkClass}>
                  <Users size={18} />
                  <span>Users</span>
                </NavLink>

                <NavLink to="/admin/teams" className={navLinkClass}>
                  <Users2 size={18} />
                  <span>Teams</span>
                </NavLink>

                <NavLink to="/admin/categories" className={navLinkClass}>
                  <Tag size={18} />
                  <span>Categories</span>
                </NavLink>

                <NavLink to="/admin/audit-logs" className={navLinkClass}>
                  <Shield size={18} />
                  <span>Audit Logs</span>
                </NavLink>
              </>
            )}

            <NavLink to="/profile" className={navLinkClass}>
              <User size={18} />
              <span>My Profile</span>
            </NavLink>
          </nav>

          {/* Notifications Bell Dropdown */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden animate-fadeIn text-slate-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-blue-600/30 border border-blue-500/50 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition cursor-pointer"
                    >
                      <CheckCheck size={14} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {loadingNotifications && notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                      <Bell size={24} className="text-slate-600" />
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 transition flex items-start gap-3 cursor-pointer ${
                          notif.is_read
                            ? "bg-slate-900/60 hover:bg-slate-800/40 text-slate-400"
                            : "bg-slate-800/40 hover:bg-slate-800/80 text-slate-200"
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {!notif.is_read ? (
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                          ) : (
                            <span className="inline-block w-2 h-2 rounded-full bg-slate-700" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs leading-relaxed font-medium">
                            {notif.message}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                            {notif.ticket_number && (
                              <span className="font-semibold text-slate-400">
                                {notif.ticket_number}
                              </span>
                            )}
                            <span>•</span>
                            <span>{formatTimeAgo(notif.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Right: User Profile & Logout */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 transition group border border-transparent hover:border-slate-700"
              title="View your profile"
            >
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-700 group-hover:ring-blue-400 transition"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight group-hover:text-blue-400 transition">
                  {user?.name || "User"}
                </p>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-semibold border ${currentRole.pill}`}
                >
                  {currentRole.label}
                </span>
              </div>
            </Link>

            <div className="h-6 w-px bg-slate-800" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 transition cursor-pointer"
              title="Sign out"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden"
              title="Profile"
            >
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-2 shadow-xl animate-fadeIn">
          {/* Mobile User Info Banner */}
          <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl mb-3 border border-slate-700">
            <div className="flex items-center gap-3">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-white">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentRole.pill}`}
            >
              {currentRole.label}
            </span>
          </div>

          <div className="space-y-1">
            <NavLink
              to={dashboardPath}
              end
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <LayoutDashboard size={20} />
              <span>{currentRole.dashLabel}</span>
            </NavLink>

            {roleId === 3 && (
              <>
                <NavLink
                  to="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <Users size={20} />
                  <span>User's Directory</span>
                </NavLink>

                <NavLink
                  to="/admin/teams"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <Users2 size={20} />
                  <span>Support Teams</span>
                </NavLink>

                <NavLink
                  to="/admin/categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <Tag size={20} />
                  <span>Ticket Categories</span>
                </NavLink>

                <NavLink
                  to="/admin/audit-logs"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <Shield size={20} />
                  <span>System Audit Logs</span>
                </NavLink>
              </>
            )}

            <NavLink
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <User size={20} />
              <span>My Profile</span>
            </NavLink>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/40 transition cursor-pointer"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
