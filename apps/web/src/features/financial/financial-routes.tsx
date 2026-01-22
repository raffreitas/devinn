import type { RouteObject } from "react-router";
import { FinancialPage } from "./pages/financial-page";

export const financialRoutes: RouteObject[] = [
  {
    index: true,
    element: <FinancialPage />,
  },
];
