import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('teamsync_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('teamsync_token'));
  const [loading, setLoading] = useState(true);

  // Sync current user on load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authService.getMe();
        setUser(data.data.user);
        localStorage.setItem('teamsync_user', JSON.stringify(data.data.user));
      } catch (err) {
        console.error('Session expired or invalid:', err);
        localStorage.removeItem('teamsync_token');
        localStorage.removeItem('teamsync_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login({ email, password });
    const { token: authToken, data: { user: authUser } } = data;
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('teamsync_token', authToken);
    localStorage.setItem('teamsync_user', JSON.stringify(authUser));
    toast.success(`Welcome back, ${authUser.fullName}!`);
    return authUser;
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await authService.register(userData);
    const { token: authToken, data: { user: authUser } } = data;
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('teamsync_token', authToken);
    localStorage.setItem('teamsync_user', JSON.stringify(authUser));
    toast.success('Account created successfully!');
    return authUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('teamsync_token');
      localStorage.removeItem('teamsync_user');
      toast.success('Logged out successfully');
    }
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem('teamsync_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
