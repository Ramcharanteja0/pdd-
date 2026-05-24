import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Heatmap from './pages/Heatmap';
import Alerts from './pages/Alerts';
import Staff from './pages/Staff';
import Predictions from './pages/Predictions';
import Vendors from './pages/Vendors';
import Incidents from './pages/Incidents';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Tracking from './pages/Tracking';
import AttendeeCheckin from './pages/AttendeeCheckin';

function ProtectedRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? <Navigate to="/dashboard" replace /> : children;
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="main-content"
        style={{
          marginLeft: sidebarOpen ? 0 : 0,
          transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Routes>
          <Route path="/dashboard"   element={<Dashboard   sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
          <Route path="/heatmap"     element={<Heatmap     sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
          <Route path="/alerts"      element={<Alerts      sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
          <Route path="/staff"       element={<Staff       sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
          <Route path="/predictions" element={<Predictions sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
          <Route path="/vendors"     element={<Vendors     sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
          <Route path="/incidents"   element={<Incidents   sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
          <Route path="/analytics"   element={<Analytics   sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
          <Route path="/settings"    element={<Settings    sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
          <Route path="/tracking"    element={<Tracking    sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
          <Route path="*"            element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuth } = useAuth();
  return (
    <Routes>
      <Route path="/"         element={<PublicRoute><Onboarding /></PublicRoute>} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/checkin"  element={<AttendeeCheckin />} />
      <Route path="/*"        element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
