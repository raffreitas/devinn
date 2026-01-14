import { createBrowserRouter } from "react-router-dom";
import { SignInPage } from "./features/auth/pages/sign-in-page";
import { BookingPage } from "./features/bookings/pages/booking-page";
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
        element: <BookingPage />,
      },
    ],
  },
]);
