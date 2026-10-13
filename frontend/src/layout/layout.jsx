
import { Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Ticket, LogOut } from "lucide-react";

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold mb-10">IT Support</h2>

        <nav className="space-y-3">
          <Link
            to="/employee"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <div className="flex items-center gap-3 p-3 text-slate-400">
            <Ticket size={20} />
            Tickets
          </div>
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 p-5 flex justify-between items-center">
          <h1 className="font-semibold text-slate-800">
            IT Support Ticket System
          </h1>
          <span className="text-sm text-slate-500">
            Frontend Development
          </span>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
