import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import { BrowserRouter } from "react-router-dom"




const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/employee" />
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
};

export default App;