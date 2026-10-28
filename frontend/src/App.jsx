import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import AgentDashboard from "./pages/AgentDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Login from "./components/form/Login.jsx";
import Register from "./components/form/Register.jsx";
import Layout from "./layout/layout.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TicketDetails from "./pages/TicketDetails.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminTeams from "./pages/AdminTeams.jsx";
import AdminCategories from "./pages/AdminCategories.jsx";
import AdminAuditLogs from "./pages/AdminAuditLogs.jsx";
import LandingPage from "./components/global/LandingPage.jsx";
import Profile from "./pages/Profile.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
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
                    {
                        path: "/admin/users",
                        element: <AdminUsers />,
                    },
                    {
                        path: "/admin/teams",
                        element: <AdminTeams />,
                    },
                    {
                        path: "/admin/categories",
                        element: <AdminCategories />,
                    },
                    {
                        path: "/admin/audit-logs",
                        element: <AdminAuditLogs />,
                    },
                ],
            },
        ],
    },

    // Shared ticket details route (Employee, Agent, Admin)
    {
        element: <ProtectedRoute allowedRoles={[1, 2, 3]} />,
        children: [
            {
                element: <Layout />,
                children: [
                    {
                        path: "/tickets/:id",
                        element: <TicketDetails />,
                    },
                    {
                        path: "/profile",
                        element: <Profile />,
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
