import { Link } from "react-router-dom";
import { Headphones, FileCode } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto text-slate-400 text-xs shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Brand & Copyright */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Headphones size={15} />
            </div>
            <p className="font-medium text-slate-400">
              © {currentYear} <span className="text-slate-200 font-semibold">IT Service Desk</span> & Support Management System. All rights reserved.
            </p>
          </div>

          {/* Center Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 rounded-full font-medium text-[11px] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All Systems Operational</span>
          </div>

          {/* Right Links */}
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-400 transition flex items-center gap-1.5 font-medium"
              title="Interactive OpenAPI 3.0 Documentation"
            >
              <FileCode size={14} className="text-slate-500 hover:text-blue-400" />
              <span>Swagger API Docs</span>
            </a>

            <span className="text-slate-700">•</span>

            <Link
              to="/profile"
              className="hover:text-blue-400 transition font-medium"
            >
              My Profile
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
