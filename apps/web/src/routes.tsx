import { createBrowserRouter } from "react-router-dom";
import { SignInPage } from "./features/auth/pages/sign-in-page";
import { BookingsListPage } from "./features/bookings/pages/bookings-list-page";
import { CalendarPage } from "./features/bookings/pages/calendar-page";
import { CategoriesPage } from "./features/inventory/pages/categories-page";
import { RoomsPage } from "./features/inventory/pages/rooms-page";
import { AppLayout } from "./shared/layouts/app-layout";
import { AuthLayout } from "./shared/layouts/auth-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
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
]);
