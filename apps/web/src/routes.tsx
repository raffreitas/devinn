import { createBrowserRouter } from "react-router";
import { loginRoutes } from "./features/auth/login-routes";
import { bookingRoutes } from "./features/bookings/booking-routes";
import { BookingCalendar } from "./features/bookings/components/booking-calendar";
import { inventoryRoutes } from "./features/inventory/inventory-routes";
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
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
