import type { RouteObject } from "react-router";
import { BookingCalendar } from "./components/booking-calendar";
import { BookingsPage } from "./pages/bookings-page";

export const bookingRoutes: RouteObject[] = [
  {
    index: true,
    element: <BookingsPage />,
  },
  {
    path: "calendar",
    element: <BookingCalendar />,
  },
];
