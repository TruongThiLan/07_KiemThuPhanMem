import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { OverviewPage } from './pages/dispatch/OverviewPage';
import { PlanRoutePage } from './pages/dispatch/PlanRoutePage';
import { AdjustRoutePage } from './pages/dispatch/AdjustRoutePage';
import { TrackStatusPage } from './pages/dispatch/TrackStatusPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DriverTripsPage } from './pages/driver/DriverTripsPage';
import { DriverTripDetailPage } from './pages/driver/DriverTripDetailPage';
import { DriverTripCustomersPage } from './pages/driver/DriverTripCustomersPage';
import { ProfilePage } from './pages/ProfilePage';
import { DispatcherDriversPage } from './pages/dispatch/DispatcherDriversPage';
import { VehiclesPage } from './pages/dispatch/VehiclesPage';
import { CustomersPage } from './pages/dispatch/CustomersPage';
import { ReportsPage } from './pages/dispatch/ReportsPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Giao diện tài xế */}
        <Route path="/driver/trips/assigned" element={<DriverTripsPage />} />
        <Route path="/driver/trips/completed" element={<DriverTripsPage />} />
        <Route path="/driver/trips/cancelled" element={<DriverTripsPage />} />
        <Route path="/driver/trips/:id" element={<DriverTripDetailPage />} />
        <Route path="/driver/trips/:id/customers" element={<DriverTripCustomersPage />} />

        {/* Điều phối lộ trình */}
        <Route path="/dispatch/overview" element={<OverviewPage />} />
        <Route path="/dispatch/plan" element={<PlanRoutePage />} />
        <Route path="/dispatch/adjust" element={<AdjustRoutePage />} />
        <Route path="/dispatch/track" element={<TrackStatusPage />} />

        <Route path="/dispatch/drivers" element={<DispatcherDriversPage />} />
        <Route path="/dispatch/vehicles" element={<VehiclesPage />} />
        <Route path="/dispatch/customers" element={<CustomersPage />} />
        <Route path="/dispatch/reports" element={<ReportsPage />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
