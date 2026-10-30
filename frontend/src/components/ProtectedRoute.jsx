import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../services/api";

const dashboardPaths = {
  EMPLOYEE: "/employee",
  SUPPORT_AGENT: "/agent",
  ADMIN: "/admin",
};

const roleIds = {
  EMPLOYEE: 1,
  SUPPORT_AGENT: 2,
  ADMIN: 3,
};

export default function ProtectedRoute({ allowedRoles }) {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("token");
    let cachedUser = null;
    try {
      cachedUser = JSON.parse(localStorage.getItem("user"));
    } catch {
      cachedUser = null;
    }

    return {
      // If we already have token and user cached, render immediately without blocking screen
      loading: Boolean(token && !cachedUser),
      user: token ? cachedUser : null,
    };
  });

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (active) {
          setSession({ loading: false, user: null });
        }
        return;
      }

      try {
        const { data } = await api.get("/auth/me");

        if (data.user.account_status !== "ACTIVE") {
          throw new Error("Account is inactive");
        }

        // Keep local cache fresh
        localStorage.setItem("user", JSON.stringify(data.user));

        if (active) {
          setSession({
            loading: false,
            user: data.user,
          });
        }
      } catch (error) {
        // Clear credentials only for authentication failures
        if ([401, 403].includes(error.response?.status)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }

        if (active) {
          setSession({
            loading: false,
            user: null,
          });
        }
      }
    };

    verifySession();

    return () => {
      active = false;
    };
  }, []);

  if (session.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!session.user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, verify permission
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = String(session.user.role).toUpperCase();
    const roleId = Number(session.user.role_id) || roleIds[role];

    if (!allowedRoles.includes(roleId)) {
      return (
        <Navigate
          to={dashboardPaths[role] || "/login"}
          replace
        />
      );
    }
  }

  return <Outlet />;
}
