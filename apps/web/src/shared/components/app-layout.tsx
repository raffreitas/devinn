import { Outlet } from "react-router";
import { AuthProvider } from "@/features/auth/contexts/auth-context";
import { STORAGE_KEYS } from "@/shared/lib/storage.ts";
import { ThemeProvider } from "../contexts/theme-context";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider } from "./ui/sidebar";

export function AppLayout() {
  return (
    <AuthProvider>
      <ThemeProvider storageKey={STORAGE_KEYS.THEME}>
        <SidebarProvider>
          <AppSidebar />
          <div className="relative flex min-h-screen flex-1 flex-col min-w-0 antialiased bg-muted/30 dark:bg-muted/10">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            <AppHeader />

            <main className="flex flex-1 flex-col gap-6 p-4 pt-6 md:p-8">
              <Outlet />
            </main>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
