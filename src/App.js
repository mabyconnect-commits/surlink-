import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import { authAPI } from './services/apiClient';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/customer/Dashboard';
import ProviderDashboard from './pages/provider/Dashboard';
import SearchServices from './pages/SearchServices';
import ServiceDetails from './pages/ServiceDetails';
import ProviderProfile from './pages/ProviderProfile';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import Profile from './pages/Profile';
import KYCVerification from './pages/provider/KYCVerification';
import ProviderServices from './pages/provider/Services';
import ProviderEarnings from './pages/provider/Earnings';
import Referrals from './pages/Referrals';
import Wallet from './pages/Wallet';
import Messages from './pages/Messages';
import Settings from './pages/Settings';

// Layout
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authAPI.login(email, password);

      if (result.success && result.user) {
        setUser(result.user);
        return result.user;
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const result = await authAPI.register(userData);

      if (result.success && result.user) {
        setUser(result.user);
        return result.user;
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('surlink_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'provider' ? '/provider/dashboard' : '/dashboard'} replace />;
  }

  return children;
}

// Public Route (redirect if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'provider' ? '/provider/dashboard' : '/dashboard'} replace />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            </Route>

            {/* Customer Routes */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/search" element={<SearchServices />} />
              <Route path="/service/:categoryId" element={<ServiceDetails />} />
              <Route path="/provider/:providerId" element={<ProviderProfile />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/booking/:bookingId" element={<BookingDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Provider Routes */}
            <Route element={<ProtectedRoute requiredRole="provider"><MainLayout /></ProtectedRoute>}>
              <Route path="/provider/dashboard" element={<ProviderDashboard />} />
              <Route path="/provider/kyc" element={<KYCVerification />} />
              <Route path="/provider/services" element={<ProviderServices />} />
              <Route path="/provider/earnings" element={<ProviderEarnings />} />
              <Route path="/provider/bookings" element={<Bookings />} />
              <Route path="/provider/profile" element={<Profile />} />
              <Route path="/provider/referrals" element={<Referrals />} />
              <Route path="/provider/wallet" element={<Wallet />} />
              <Route path="/provider/messages" element={<Messages />} />
              <Route path="/provider/settings" element={<Settings />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
