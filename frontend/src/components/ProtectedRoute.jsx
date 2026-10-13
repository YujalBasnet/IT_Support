
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const roleId = Number(user.role_id);

  // Logged in but not authorized for this dashboard
  if (!allowedRoles.includes(roleId)) {
    const dashboardPaths = {
      1: "/employee",
      2: "/agent",
      3: "/admin",
    };

    return (
      <Navigate
        to={dashboardPaths[roleId] || "/login"}
        replace
      />
    );
  }

  return <Outlet />;
}
