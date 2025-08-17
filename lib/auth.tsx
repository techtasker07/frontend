'use client'

// Authentication utilities and context
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, User } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone_number?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>; // Added refreshUser function
  loading: boolean;
  isAuthenticated: boolean;
  justLoggedIn: boolean; // Track if user just logged in
  setJustLoggedIn: (value: boolean) => void;
}

// Create context with a non-nullable type using type assertion
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Helper function to fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.success) {
        setUser(response.data.user);
      } else {
        // Token is invalid, remove it
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Token is invalid, remove it
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Check for stored token on mount
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Verify token and get user data
      fetchCurrentUser().finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      if (response.success) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        setJustLoggedIn(true); // Mark that user just logged in
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone_number?: string;
  }) => {
    try {
      const response = await api.register(userData);
      if (response.success) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        setJustLoggedIn(true); // Mark that user just registered/logged in
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setJustLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };

  // New refreshUser function to refetch user data
  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser();
    }
  };

  const value: AuthContextType = { // Explicitly type the value object
    user,
    token,
    login,
    register,
    logout,
    refreshUser, // Added refreshUser to the context value
    loading,
    isAuthenticated: !!user && !!token,
    justLoggedIn,
    setJustLoggedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}