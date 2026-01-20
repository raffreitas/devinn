import { Building2Icon } from "lucide-react";
import { env } from "@/env";
import { SidebarTrigger } from "./ui/sidebar";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-12 sm:h-14 items-center gap-3 border-b bg-background/80 px-3 sm:px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-md bg-muted">
          <Building2Icon className="size-4 text-muted-foreground" />
        </div>
      </div>

      {env.MODE === "development" && (
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Development</span>
        </div>
      )}
    </header>
  );
}
