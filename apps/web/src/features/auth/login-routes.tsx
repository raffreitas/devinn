import type { RouteObject } from "react-router";
import { ForgotPasswordPage } from "./pages/forgot-password-page";
import { LoginPage } from "./pages/login-page";
import { ResetPasswordPage } from "./pages/reset-password-page";

export const loginRoutes: RouteObject[] = [
  {
    index: true,
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
];
