import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import AgentDashboard from "./pages/AgentDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Login from "./components/form/Login.jsx";
import Layout from "./layout/layout.jsx";





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
    element: <Layout />,
    children: [
      {
        path: "/employee",
        element: <EmployeeDashboard />,
      },
      {
        path: "/agent",
        element: <AgentDashboard />,
      },
      {
        path: "/admin",
        element: <AdminDashboard />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;

