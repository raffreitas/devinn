import { createBrowserRouter } from "react-router";
import { loginRoutes } from "./features/auth/login-routes";
import { ProfilePage } from "./features/auth/pages/profile-page";
import { bookingRoutes } from "./features/bookings/booking-routes";
import { BookingCalendar } from "./features/bookings/components/booking-calendar";
import { financialRoutes } from "./features/financial/financial-routes";
import { SettingsPage } from "./features/inns/pages/settings-page";
import { inventoryRoutes } from "./features/inventory/inventory-routes";
import { AppLayout } from "./shared/components/app-layout";
import { RequireAuth } from "./shared/components/auth-guard";
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
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <BookingCalendar />,
          },
          {
            path: "/inventory",
            children: inventoryRoutes,
          },
          {
            path: "/bookings",
            children: bookingRoutes,
          },
          {
            path: "/financial",
            children: financialRoutes,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
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
