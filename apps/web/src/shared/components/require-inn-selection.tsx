import { Building2Icon, Loader2Icon } from "lucide-react";
import { Outlet } from "react-router";
import { useAuth } from "@/features/auth/contexts/auth-context";

export function RequireInnSelection() {
  const { innId, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (innId) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-md bg-muted">
          <Building2Icon className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Selecione uma pousada
          </h1>
          <p className="text-sm text-muted-foreground">
            Use o seletor na barra lateral para carregar reservas, financeiro e
            configurações.
          </p>
        </div>
      </div>
    </div>
  );
}
