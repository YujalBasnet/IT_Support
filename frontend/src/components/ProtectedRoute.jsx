
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../services/api";

const dashboardPaths = {
  EMPLOYEE: "/employee",
  SUPPORT_AGENT: "/agent",
  ADMIN: "/admin",
};

export default function ProtectedRoute({ allowedRoles }) {
  const [session, setSession] = useState({
    loading: true,
    user: null,
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

        if (active) {
          setSession({
            loading: false,
            user: data.user,
          });
        }
      } catch (error) {
        // Clear credentials only for authentication failures.
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Verifying your session...</p>
      </div>
    );
  }

  if (!session.user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(session.user.role).toUpperCase();

  const roleIds = {
    EMPLOYEE: 1,
    SUPPORT_AGENT: 2,
    ADMIN: 3,
  };

  const roleId = roleIds[role];

  if (!allowedRoles.includes(roleId)) {
    return (
      <Navigate
        to={dashboardPaths[role] || "/login"}
        replace
      />
    );
  }

  return <Outlet />;
}
