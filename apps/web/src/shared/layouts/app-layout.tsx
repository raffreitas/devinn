import { isAxiosError } from "axios";
import { useLayoutEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { api } from "@/shared/lib/http-client";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { TenantProvider } from "@/shared/contexts/tenant-context";

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
      <div className="flex min-h-screen bg-background text-foreground antialiased">
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </TenantProvider>
  );
}
