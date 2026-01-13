import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Home, Calendar, DollarSign, Settings, LogOut, Hotel } from 'lucide-react';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Disponibilidade', href: '/availability', icon: Calendar },
    { name: 'Reservas', href: '/bookings', icon: Hotel },
    { name: 'Financeiro', href: '/financial', icon: DollarSign },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">DevInn</h1>
        </div>
        
        <div className="flex flex-col justify-between p-4" style={{ height: 'calc(100% - 4rem)' }}>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-4">
            <div className="rounded-lg border bg-gray-50 p-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              {user?.inn && (
                <p className="mt-1 text-xs text-gray-600">{user.inn.name}</p>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
