import { Home, Package, Calendar, DollarSign, Menu, LogOut, Layers, Receipt } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useTenant } from '@/shared/contexts/tenant-context';
import { authService } from '@/features/auth/services/auth-service';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/shared/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Categorias', href: '/inventory/categories', icon: Layers },
  { name: 'Quartos', href: '/inventory/rooms', icon: Package },
  { name: 'Reservas', href: '/bookings', icon: Calendar },
  { name: 'Financeiro', href: '/financial', icon: DollarSign },
  { name: 'Despesas', href: '/financial/expenses', icon: Receipt },
];

export function AppSidebar() {
  const location = useLocation();
  const { userRole } = useTenant();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    authService.signOut();
    window.location.href = '/sign-in';
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 border-b bg-background lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menu</span>
          </button>

          <h1 className="text-lg font-semibold">DevInn</h1>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {userRole === 'SuperAdmin' ? 'SA' : 'IA'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <nav className="fixed left-0 top-16 bottom-0 w-64 bg-background border-r p-4">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r bg-background">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-xl font-bold">DevInn</h1>
          <ThemeToggle />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="text-xs font-medium">
                    {userRole === 'SuperAdmin' ? 'SA' : 'IA'}
                  </span>
                </div>
                <span className="text-sm">
                  {userRole === 'SuperAdmin' ? 'Super Admin' : 'Inn Admin'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
