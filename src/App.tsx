import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Clubs from './pages/Clubs';
import Schedule from './pages/Schedule';
import Events from './pages/Events';
import AuthPage from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import ClubManage from './pages/ClubManage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DataProvider } from './contexts/DataContext';

// Simple wrapper to redirect authenticated users away from /auth
const AuthRoute: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="clubs" element={<Clubs />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="events" element={<Events />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="manage-club" element={<ClubManage />} />
        </Route>
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
