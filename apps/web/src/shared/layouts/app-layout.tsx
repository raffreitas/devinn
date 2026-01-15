import { isAxiosError } from "axios";
import { useLayoutEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppHeader } from "@/shared/components/app-header";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { TenantProvider } from "@/shared/contexts/tenant-context";
import { api } from "@/shared/lib/http-client";

export function AppLayout() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (isAxiosError(error)) {
          const status = error.response?.status;

          if (status === 401) {
            navigate("/sign-in", {
              replace: true,
            });
          }
        }

        return Promise.reject(error);
      },
    );
    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [navigate]);

  return (
    <TenantProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="relative flex min-h-screen flex-1 flex-col antialiased bg-muted/30 dark:bg-muted/10">
          <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          <AppHeader />

          <main className="flex flex-1 flex-col gap-6 p-8 pt-6">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </TenantProvider>
  );
}
