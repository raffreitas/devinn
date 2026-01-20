import { createBrowserRouter, Outlet } from "react-router";
import { loginRoutes } from "./features/auth/login-routes";
import { RoomCategoryPage } from "./features/inventory/pages/room-category-page";
import { AppLayout } from "./shared/components/app-layout";
import { RequireGuest } from "./shared/components/guest-guard";
import { NotFoundPage } from "./shared/pages/not-found-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RequireGuest />,
    children: loginRoutes,
  },
  {
    path: "/",
    // element: <Outlet />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            path: "/",
            element: <RoomCategoryPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
