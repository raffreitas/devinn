import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="relative min-h-screen grid grid-cols-1 items-center justify-center antialiased lg:grid lg:grid-cols-2 lg:max-w-none lg:px-0">
      <div className="relative hidden h-full flex-col border-r border-foreground/5 bg-muted p-10 text-muted-foreground dark:border-r lg:flex">
        <div className="flex items-center gap-3 text-lg font-medium text-foreground">
          <span className="font-semibold">dev.inn</span>
        </div>
        <div className="mt-auto">
          <footer className="text-sm">
            &copy; dev.inn - {new Date().getFullYear()}
          </footer>
        </div>
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}
