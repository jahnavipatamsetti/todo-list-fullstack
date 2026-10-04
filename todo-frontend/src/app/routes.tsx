import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      {
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "tasks",
        Component: Tasks,
      },
      {
        path: "settings",
        Component: Settings,
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
