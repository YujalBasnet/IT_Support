import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Headphones,
  Ticket,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lock,
  Layers,
  FileText,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Paperclip,
  Activity,
  UserCheck,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  // Check if user is already authenticated
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (stored && token) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const getDashboardPath = () => {
    if (!currentUser) return "/login";
    const roleId = Number(currentUser.role_id);
    if (roleId === 1) return "/employee";
    if (roleId === 2) return "/agent";
    if (roleId === 3) return "/admin";
    return "/login";
  };

  const [activeRoleTab, setActiveRoleTab] = useState("employee");

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-500 selection:text-white relative overflow-hidden font-sans">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/10 blur-[130px] rounded-full pointer-events-none -z-0" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-0" />

      {/* Header / Top Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/75 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              <Headphones size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
                IT Support <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Hub</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-none">Enterprise Service Desk</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#portals" className="hover:text-blue-400 transition-colors">Role Portals</a>
            <a href="#workflow" className="hover:text-blue-400 transition-colors">Workflow</a>
            <a href="#stats" className="hover:text-blue-400 transition-colors">Live Metrics</a>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition cursor-pointer"
              >
                <span>Dashboard ({currentUser.name?.split(" ")[0] || "User"})</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition cursor-pointer"
                >
                  <span>Launch Portal</span>
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-blue-400 mb-8 backdrop-blur-md animate-in fade-in duration-700">
            <Sparkles size={14} className="text-blue-400" />
            <span>Next-Generation IT Service Management</span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-slate-400 font-normal">Real-Time RBAC</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Resolve IT Incidents. <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Zero Friction. Maximum Velocity.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A unified support infrastructure connecting Employees, Support Engineers, and System Administrators with automated team assignment, live status transitions, and immutable audit logs.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(currentUser ? getDashboardPath() : "/login")}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-base shadow-xl shadow-blue-600/25 transition cursor-pointer"
            >
              <Ticket size={20} />
              <span>{currentUser ? "Open My Dashboard" : "Submit Support Request"}</span>
              <ArrowRight size={18} />
            </button>

            <a
              href="#portals"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-base transition"
            >
              <span>Explore Roles & Portals</span>
              <ChevronRight size={18} className="text-slate-400" />
            </a>
          </div>

          {/* Micro trust indicators */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">99.8%</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">SLA Compliance</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">&lt; 15 Mins</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">First Response Time</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">3 Tiers</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">RBAC Architecture</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">100%</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Audited History</p>
            </div>
          </div>
        </div>

        {/* Live Interactive Ticket Simulation Mockup */}
        <div className="mt-16 relative max-w-5xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-blue-500/30 via-slate-800/50 to-transparent shadow-2xl">
          <div className="rounded-[22px] bg-slate-950/90 border border-slate-800/80 overflow-hidden backdrop-blur-xl">
            {/* Mock window top bar */}
            <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-slate-400">IT_Support_Console — Live State Machine</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                System Active
              </span>
            </div>

            {/* Mock window body */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ticket Card 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-400 font-mono">#TKT-171802</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    IN PROGRESS
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">VPN Gateway unreachable from remote subnet</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  Employee cannot establish IPSec tunnel to staging cluster. Diagnostic logs attached.
                </p>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <UserCheck size={13} className="text-purple-400" /> Sarah (Network Ops)
                  </span>
                  <span>2m ago</span>
                </div>
              </div>

              {/* Ticket Card 2 */}
              <div className="rounded-2xl border border-blue-500/40 bg-blue-950/20 p-5 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-400 font-mono">#TKT-171810</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    OPEN • URGENT
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">SSO Authentication Token Expired</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  OAuth callback failing with expired authorization grant for sales engineering team.
                </p>
                <div className="pt-3 border-t border-blue-900/40 flex items-center justify-between text-[11px]">
                  <span className="text-blue-300 font-medium flex items-center gap-1.5">
                    <Clock size={13} /> Queued for Assignment
                  </span>
                  <span className="text-slate-400">Just now</span>
                </div>
              </div>

              {/* Ticket Card 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-400 font-mono">#TKT-171790</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                    RESOLVED
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">New M3 Max Workstation Provisioning</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  Asset provisioned with disk encryption, MDM enrollment, and developer toolchain.
                </p>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 size={13} className="text-green-400" /> Alex (Hardware Desk)
                  </span>
                  <span>1h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Built for Reliability</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for Modern IT Workflows
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Everything your technology and operations teams need to coordinate resolutions, maintain compliance, and eliminate backlog chaos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-8 hover:border-blue-500/40 hover:bg-slate-900/50 transition duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Automated Ticket Assignment</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Admins instantly assign tickets to dedicated specialist support teams (Network, Hardware, DevOps) with intelligent member rosters.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-8 hover:border-purple-500/40 hover:bg-slate-900/50 transition duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">State-Machine Status Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Strict status transition rules prevent invalid status changes (e.g. Open → In Progress → Waiting For User → Resolved → Closed).
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-8 hover:border-indigo-500/40 hover:bg-slate-900/50 transition duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Internal Staff Notes</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Agents can post private internal comments hidden from requesters for collaborative debugging and escalation notes.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-8 hover:border-emerald-500/40 hover:bg-slate-900/50 transition duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
              <Paperclip size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Diagnostic File Uploads</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Attach screenshots, stack traces, and crash dumps directly to tickets with secure tokenized download links.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-8 hover:border-amber-500/40 hover:bg-slate-900/50 transition duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
              <Activity size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Full Audit History Trail</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Complete chronological ledger tracks every status change, reassignment, and comment with author and timestamp.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-8 hover:border-rose-500/40 hover:bg-slate-900/50 transition duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Centralized User & Team Admin</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Admins configure support teams, promote/demote roles, activate accounts, and manage ticket category taxonomies.
            </p>
          </div>
        </div>
      </section>

      {/* Role Portals Interactive Section */}
      <section id="portals" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80 bg-slate-950/30 rounded-3xl my-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Built for Every Role</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Tailored Experiences for Each Stakeholder
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Switch between personas to see how our RBAC architecture powers individual workflows.
          </p>

          {/* Persona Tabs */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveRoleTab("employee")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeRoleTab === "employee"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Employee Portal
            </button>
            <button
              onClick={() => setActiveRoleTab("agent")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeRoleTab === "agent"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Support Agent Desk
            </button>
            <button
              onClick={() => setActiveRoleTab("admin")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeRoleTab === "admin"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Admin Command Center
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeRoleTab === "employee" && (
            <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-900 to-blue-950/20 p-8 sm:p-10">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Role: Employee (User)</span>
                  <h3 className="text-2xl font-bold text-white">Submit, Monitor, and Resolve</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Employees can submit IT assistance requests with category tagging, upload diagnostic logs, monitor real-time SLA progress, and converse with assigned technicians directly.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-blue-400" />
                      Intuitive modal for rapid ticket creation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-blue-400" />
                      Debounced search and live filter by status / priority
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-blue-400" />
                      Automated email alerts on status changes
                    </li>
                  </ul>
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    Open Employee View <ArrowRight size={16} />
                  </button>
                </div>
                <div className="w-full md:w-72 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <p className="text-xs font-mono text-slate-400">Employee Summary</p>
                  <div className="p-3 bg-slate-900 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-slate-400">Open Tickets</span>
                    <span className="font-bold text-blue-400">3 Active</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-slate-400">Average Turnaround</span>
                    <span className="font-bold text-green-400">1.4h</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === "agent" && (
            <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900 to-purple-950/20 p-8 sm:p-10">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Role: Support Agent</span>
                  <h3 className="text-2xl font-bold text-white">Focus on Incident Triage</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Support agents receive tickets assigned directly to their queue. They can quickly transition statuses from the table, post private staff notes, and download diagnostic attachments.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-purple-400" />
                      One-click quick actions: "Start Work", "Mark Resolved"
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-purple-400" />
                      Internal collaboration notes hidden from requesters
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-purple-400" />
                      Priority-sorted queue with SLA indicators
                    </li>
                  </ul>
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 cursor-pointer"
                  >
                    Open Agent Desk <ArrowRight size={16} />
                  </button>
                </div>
                <div className="w-full md:w-72 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <p className="text-xs font-mono text-slate-400">Agent Performance</p>
                  <div className="p-3 bg-slate-900 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-slate-400">Assigned Queue</span>
                    <span className="font-bold text-purple-400">8 Tickets</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-slate-400">Resolved Today</span>
                    <span className="font-bold text-green-400">12 Closed</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeRoleTab === "admin" && (
            <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-br from-slate-900 to-rose-950/20 p-8 sm:p-10">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Role: System Administrator</span>
                  <h3 className="text-2xl font-bold text-white">Total Control & Oversight</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Administrators have universal visibility over all incidents, real-time assignment controls to route tickets to teams, complete user directory permission management, and category administration.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-rose-400" />
                      Live ticket assignment engine with team member filtering
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-rose-400" />
                      Manage support teams, rosters, and category taxonomy
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-rose-400" />
                      Assign user roles (Employee, Agent, Admin) and status
                    </li>
                  </ul>
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    Open Admin Workspace <ArrowRight size={16} />
                  </button>
                </div>
                <div className="w-full md:w-72 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <p className="text-xs font-mono text-slate-400">Organization Health</p>
                  <div className="p-3 bg-slate-900 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total System Tickets</span>
                    <span className="font-bold text-rose-400">142 Logged</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-slate-400">Active Support Teams</span>
                    <span className="font-bold text-indigo-400">5 Teams</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Workflow Section */}
      <section id="workflow" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Simplicity First</p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How The Support Hub Works
          </h2>
          <p className="mt-4 text-base text-slate-400">
            From initial report to verified resolution in three streamlined steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 relative">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm mb-6 shadow-md shadow-blue-600/30">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Report & Classify</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Log in with your corporate Google identity and describe your issue with appropriate priority and category tags.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 relative">
            <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mb-6 shadow-md shadow-indigo-600/30">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Assign & Investigate</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ticket routes to the appropriate support engineering team. Technicians diagnose issues with shared attachments and comments.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 relative">
            <div className="h-10 w-10 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm mb-6 shadow-md shadow-purple-600/30">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Resolve & Verify</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Incident marked as RESOLVED with audit logging. Requesters are notified instantly to verify the fix or reopen if needed.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl p-10 sm:p-16 bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-purple-900/60 border border-slate-700/60 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Ready to Upgrade Your IT Support?
            </h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto mb-8">
              Sign in with your organizational Google account and start tracking your support tickets immediately.
            </p>
            <button
              onClick={() => navigate(currentUser ? getDashboardPath() : "/login")}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-900 font-extrabold text-base hover:bg-slate-100 transition shadow-xl cursor-pointer"
            >
              <span>{currentUser ? "Go to Dashboard" : "Get Started with Google SSO"}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Headphones size={18} />
            </div>
            <span className="font-bold text-white text-sm">IT Support Hub</span>
            <span className="text-xs text-slate-500">© {new Date().getFullYear()} IT Support || Made with ❤️ by Yujal Khulal Basnet & Yogesh Phuyal.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              All Services Operational
            </span>
            <a href="#features" className="hover:text-slate-200">Architecture</a>
            <a href="#portals" className="hover:text-slate-200">Role Portals</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
