import { isAxiosError } from "axios";
import { useLayoutEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { api } from "@/shared/lib/http-client";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { TenantProvider } from "@/shared/contexts/tenant-context";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";

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
        <SidebarTrigger />

        <div className="flex min-h-screen flex-col antialiased">
          <main className="flex flex-1 flex-col gap-4 p-8 pt-6">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </TenantProvider>
  );
}
