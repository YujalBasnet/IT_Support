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

// Top-level authentication verification
export default function ProtectedRoute() {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("token");
    let cachedUser = null;
    try {
      cachedUser = JSON.parse(localStorage.getItem("user"));
    } catch {
      cachedUser = null;
    }

    return {
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

  return <Outlet />;
}

// Synchronous, zero-latency role verification without network requests or loading states
export function RoleRoute({ allowedRoles }) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role).toUpperCase();
  const roleId = Number(user.role_id) || roleIds[role];

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
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
