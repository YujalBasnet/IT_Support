import { Link } from "react-router-dom";
import { Headphones, Shield, FileCode, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Brand & Copyright */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Headphones size={14} />
            </div>
            <p className="font-medium text-slate-600">
              © {currentYear} IT Service Desk & Support Management System. All rights reserved.
            </p>
          </div>

          {/* Center Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Systems Operational</span>
          </div>

          {/* Right Links */}
          <div className="flex items-center gap-4 text-slate-500">
            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 transition flex items-center gap-1 font-medium"
              title="Interactive OpenAPI 3.0 Documentation"
            >
              <FileCode size={14} />
              <span>Swagger API Docs</span>
            </a>

            <span className="text-slate-300">•</span>

            <Link
              to="/profile"
              className="hover:text-blue-600 transition font-medium"
            >
              My Profile
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

