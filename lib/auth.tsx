'use client'

// Authentication utilities and context
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';
import type { User as SupabaseUser, AuthError } from '@supabase/supabase-js';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

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
  signInWithGoogle: (context?: 'login' | 'register') => Promise<void>;
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

  // Helper function to fetch current user profile from profiles table
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }

      if (session) {
        setToken(session.access_token);
        const userProfile = await fetchUserProfile(session.user.id);
        if (userProfile) {
          setUser(userProfile);
        }
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setToken(session.access_token);
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            setUser(userProfile);
          }
        } else {
          setUser(null);
          setToken(null);
          setJustLoggedIn(false);
        }
      }
    );

    // Auto-refresh session every 50 minutes (3000000 ms) to prevent expiration
    const refreshInterval = setInterval(async () => {
      if (user && token) {
        try {
          console.log('Auto-refreshing session...');
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Error refreshing session:', error);
          } else if (data.session) {
            console.log('Session refreshed successfully');
            setToken(data.session.access_token);
          }
        } catch (error) {
          console.error('Failed to refresh session:', error);
        }
      }
    }, 3000000); // 50 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session) {
        setToken(data.session.access_token);
        const userProfile = await fetchUserProfile(data.session.user.id);
        if (userProfile) {
          setUser(userProfile);
        }
        setJustLoggedIn(true);
      }
    } catch (error: any) {
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
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Create profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone_number: userData.phone_number,
          });

        if (profileError) {
          // Only throw error if it's not a duplicate key error (user already exists)
          if (!profileError.message.includes('duplicate key') && !profileError.message.includes('already exists')) {
            throw new Error('Failed to create user profile: ' + profileError.message);
          }
        }

        // If session is available, set user data (user is immediately logged in)
        if (data.session) {
          setToken(data.session.access_token);
          const userProfile = await fetchUserProfile(data.session.user.id);
          if (userProfile) {
            setUser(userProfile);
          }
          // Don't set justLoggedIn to true during registration
          // This prevents the prospect modal from opening immediately after registration
          // setJustLoggedIn(true);
        }
        // If no session, it means email confirmation is required
        // This is still a successful registration, just needs email confirmation
      }
    } catch (error: any) {
      throw error;
    }
  };

  const signInWithGoogle = async (context: 'login' | 'register' = 'login') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?context=${context}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setToken(null);
      setJustLoggedIn(false);
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear local state even if signOut fails
      setUser(null);
      setToken(null);
      setJustLoggedIn(false);
    }
  };

  // New refreshUser function to refetch user data
  const refreshUser = async () => {
    if (user?.id) {
      const userProfile = await fetchUserProfile(user.id);
      if (userProfile) {
        setUser(userProfile);
      }
    }
  };

  const value: AuthContextType = { // Explicitly type the value object
    user,
    token,
    login,
    register,
    signInWithGoogle,
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
