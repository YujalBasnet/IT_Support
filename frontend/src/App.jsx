import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import AgentDashboard from "./pages/AgentDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Login from "./components/form/Login.jsx";
import Layout from "./layout/layout.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";





  const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },

  // Employee routes
  {
    element: <ProtectedRoute allowedRoles={[1]} />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: "/employee",
            element: <EmployeeDashboard />,
          },
        ],
      },
    ],
  },

  // Support agent routes
  {
    element: <ProtectedRoute allowedRoles={[2]} />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: "/agent",
            element: <AgentDashboard />,
          },
        ],
      },
    ],
  },

  // Admin routes
  {
    element: <ProtectedRoute allowedRoles={[3]} />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: "/admin",
            element: <AdminDashboard />,
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
