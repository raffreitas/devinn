import { isAxiosError } from "axios";
import { useLayoutEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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
    <div className="flex min-h-screen flex-col antialiased bg-background text-foreground">
      <div className="flex flex-1 flex-col gap-4 p-8 pt-6">
        <Outlet />
      </div>
    </div>
  );
}
