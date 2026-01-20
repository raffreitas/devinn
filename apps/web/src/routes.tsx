import { createBrowserRouter } from "react-router-dom";
import { SignInPage } from "./features/auth/pages/sign-in-page";
import { BookingsListPage } from "./features/bookings/pages/bookings-list-page";
import { CalendarPage } from "./features/bookings/pages/calendar-page";
import { CategoriesPage } from "./features/inventory/pages/categories-page";
import { RoomsPage } from "./features/inventory/pages/rooms-page";
import { RequireAuth } from "./shared/components/auth-guard";
import { RequireGuest } from "./shared/components/guest-guard";
import { AppLayout } from "./shared/layouts/app-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RequireGuest />,
    children: [
      {
        index: true,
        path: "/sign-in",
        element: <SignInPage />,
      },
    ],
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          {
            path: "/",
            index: true,
            element: <CalendarPage />,
          },
          {
            path: "/inventory",
            children: [
              {
                path: "categories",
                element: <CategoriesPage />,
              },
              {
                path: "rooms",
                element: <RoomsPage />,
              },
            ],
          },
          {
            path: "/bookings",
            children: [
              {
                index: true,
                element: <BookingsListPage />,
              },
              {
                path: "calendar",
                element: <CalendarPage />,
              },
            ],
          }
        ],
      },
    ],
  },
]);
