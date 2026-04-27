import React from "react";
import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Room } from "./pages/Room";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";
import { RouteError } from "./pages/RouteError";
import { Auth } from "./pages/Auth";
import { RequireAuth } from "./components/RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
    errorElement: <RouteError />,
  },
  {
    path: "/room/:roomId",
    Component: () => (
      <RequireAuth>
        <Room />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
  },
  {
    path: "/profile",
    Component: () => (
      <RequireAuth>
        <Profile />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
  },
  {
    path: "/auth",
    Component: Auth,
    errorElement: <RouteError />,
  },
  {
    path: "/auth/callback",
    Component: Auth,
    errorElement: <RouteError />,
  },
  {
    path: "*",
    Component: NotFound,
    errorElement: <RouteError />,
  },
]);
