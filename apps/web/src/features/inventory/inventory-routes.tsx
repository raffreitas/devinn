import type { RouteObject } from "react-router";
import { CategoriesPage } from "./pages/categories-page";
import { RoomsPage } from "./pages/rooms-page";

export const inventoryRoutes: RouteObject[] = [
  {
    path: "categories",
    element: <CategoriesPage />,
  },
  {
    path: "rooms",
    element: <RoomsPage />,
  },
];
