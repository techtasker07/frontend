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
  loading: boolean;
  isAuthenticated: boolean;
}

// Create context with a non-nullable type using type assertion
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Verify token and get user data
      api.getCurrentUser()
        .then((response) => {
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
            setToken(null);
          }
        })
        .catch((error) => {
          console.error('Token verification failed:', error);
          // Token is invalid, remove it
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => {
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
        localStorage.setItem('token', token);
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
        localStorage.setItem('token', token);
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
    localStorage.removeItem('token');
  };

  const value: AuthContextType = { // Explicitly type the value object
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
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