import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/shared/components/ui/sonner";
import { queryClient } from "@/shared/lib/react-query";
import { router } from "./routes";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      <Toaster richColors theme="light" />
    </QueryClientProvider>
  );
}
