import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Protected Pages
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/dashboard/DashboardPage';
import TeamMembersPage from './pages/dashboard/TeamMembersPage';
import AvailabilityPage from './pages/dashboard/AvailabilityPage';
import ActivityHistoryPage from './pages/dashboard/ActivityHistoryPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import SettingsPage from './pages/dashboard/SettingsPage';
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  borderRadius: '14px',
                  background: '#1E293B',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />

            <Routes>
              {/* Public Landing */}
              <Route path="/" element={<LandingPage />} />

              {/* Authentication Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="members" element={<TeamMembersPage />} />
                <Route path="availability" element={<AvailabilityPage />} />
                <Route path="history" element={<ActivityHistoryPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
