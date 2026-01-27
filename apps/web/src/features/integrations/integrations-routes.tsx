import type { RouteObject } from "react-router";
import { IntegrationsPage } from "./pages/integrations-page";

export const integrationsRoutes: RouteObject[] = [
  {
    index: true,
    element: <IntegrationsPage />,
  },
];
