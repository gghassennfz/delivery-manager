import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/common/Header';
import Login from './components/auth/Login';
import ProjectOwnerDashboard from './components/dashboard/projectowner/ProjectOwnerDashboard';
import DeliveryGuyDashboard from './components/dashboard/deliveryguy/DeliveryGuyDashboard';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';
import AnimatedBackground from './components/common/AnimatedBackground';
import './i18n/config';
import './index.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

const AppContent = () => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  const getDashboard = () => {
    switch (userRole) {
      case 'project-owner':
        return <ProjectOwnerDashboard />;
      case 'delivery-guy':
        return <DeliveryGuyDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center relative">
            <AnimatedBackground />
            <div className="text-center relative z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Unknown Role
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please contact an administrator.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {getDashboard()}
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AppContent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppContent />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
