
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  LogOut,
  Headphones,
} from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const roleId = Number(user?.role_id);

  const dashboardPaths = {
    1: "/employee",
    2: "/agent",
    3: "/admin",
  };

  const dashboardPath = dashboardPaths[roleId] || "/login";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Your backend uses stateless JWTs, so removing the
    // local token signs the user out of this browser.
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-700">
          <Headphones size={28} className="text-blue-400" />
          <h2 className="text-xl font-bold">IT Support</h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to={dashboardPath}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          <NavLink
            to={dashboardPath}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition"
          >
            <Ticket size={20} />
            Tickets Queue
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-slate-800 cursor-pointer transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <h1 className="font-semibold text-slate-800">
            IT Support Ticket System
          </h1>

          <div className="flex items-center gap-3">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500">
                {roleId === 3
                  ? "Administrator"
                  : roleId === 2
                  ? "Support Agent"
                  : "Employee"}
              </p>
            </div>
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
