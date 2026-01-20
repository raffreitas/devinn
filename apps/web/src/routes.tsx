import { createBrowserRouter } from "react-router";
import { Button } from "./shared/components/ui/button";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <div><Button >Pão</Button></div>,
  },
]);
