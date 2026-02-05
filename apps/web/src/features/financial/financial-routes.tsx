import type { RouteObject } from "react-router";
import { ExpensesPage } from "./pages/expenses-page";
import { FinancialPage } from "./pages/financial-page";

export const financialRoutes: RouteObject[] = [
  {
    index: true,
    element: <FinancialPage />,
  },
  {
    path: "expenses",
    element: <ExpensesPage />,
  },
];
