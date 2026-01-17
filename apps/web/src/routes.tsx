import { createBrowserRouter } from "react-router-dom";
import { SignInPage } from "./features/auth/pages/sign-in-page";
import { BookingsListPage } from "./features/bookings/pages/bookings-list-page";
import { CalendarPage } from "./features/bookings/pages/calendar-page";
import { ExpensesPage } from "./features/financial/pages/expenses-page";
import { FinancialDashboardPage } from "./features/financial/pages/financial-dashboard-page";
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
      },
      {
        path: "/financial",
        children: [
          {
            index: true,
            element: <FinancialDashboardPage />,
          },
          {
            path: "expenses",
            element: <ExpensesPage />,
          },
        ],
      },
    ],
  },
]);
