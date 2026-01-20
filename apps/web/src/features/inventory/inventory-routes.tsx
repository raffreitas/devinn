import type { RouteObject } from "react-router";
import { CategoriesPage } from "./pages/categories-page";

export const inventoryRoutes: RouteObject[] = [
  {
    path: "categories",
    element: <CategoriesPage />,
  },
];
