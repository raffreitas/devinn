import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router";
import { Toaster } from "@/shared/components/ui/sonner.tsx";
import { router } from "./routes";
import { queryClient } from "./shared/lib/react-query";
import { ThemeProvider } from "./shared/contexts/theme-context";
import { STORAGE_KEYS } from "./shared/lib/storage";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey={STORAGE_KEYS.THEME}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
