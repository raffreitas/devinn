import type { RouteObject } from "react-router";
import { LoginPage } from "./pages/login-page";

export const loginRoutes: RouteObject[] = [
  {
    index: true,
    path: "/login",
    element: <LoginPage />,
  },
];
