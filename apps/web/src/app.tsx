import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers/query-provider';
import { AuthProvider } from './providers/auth-provider';
import { ProtectedRoute } from './features/auth/protected-route';
import { LoginPage } from './features/auth/login-page';
import { AppLayout } from './components/layouts/app-layout';
import { RoomsPage } from './features/rooms/rooms-page';
import { BookingsListPage } from './features/bookings/bookings-list-page';
import { AvailabilityMapPage } from './features/availability/availability-map-page';
import { FinancialDashboardPage } from './features/financial/financial-dashboard-page';

// Placeholder pages
function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4 text-gray-600">Em desenvolvimento...</p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                // <ProtectedRoute>
                  <AppLayout />
                // </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="/availability" element={<AvailabilityMapPage />} />
              <Route path="/bookings" element={<BookingsListPage />} />
              <Route path="/financial" element={<FinancialDashboardPage />} />
              <Route path="/settings" element={<RoomsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}
