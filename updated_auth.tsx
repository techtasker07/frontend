'use client'

// Updated Authentication utilities for RLS-free registration
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './lib/supabase';
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
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  justLoggedIn: boolean;
  setJustLoggedIn: (value: boolean) => void;
}

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

  // Helper function to create profile using the unrestricted function
  const createProfileWithFunction = async (userData: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  }): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('create_profile_unrestricted', {
        user_id: userData.id,
        user_email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number || null
      });

      if (error) {
        console.error('Error creating profile with function:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to create profile with function:', error);
      return false;
    }
  };

  // Direct profile creation fallback
  const createProfileDirect = async (userData: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_number: userData.phone_number,
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error creating profile directly:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to create profile directly:', error);
      return false;
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

    return () => subscription.unsubscribe();
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
      console.log('Starting registration process...');
      
      // Step 1: Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        console.error('Auth registration error:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Registration failed - no user returned');
      }

      console.log('User created in auth, creating profile...');

      // Step 2: Create profile using multiple approaches
      const profileData = {
        id: data.user.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number,
      };

      let profileCreated = false;

      // Try using the function first
      profileCreated = await createProfileWithFunction(profileData);

      // If function failed, try direct insert
      if (!profileCreated) {
        console.log('Function method failed, trying direct insert...');
        profileCreated = await createProfileDirect(profileData);
      }

      if (!profileCreated) {
        console.warn('Profile creation failed, but user was created in auth. This might be OK if email confirmation is required.');
        // Don't throw error here as the user was created successfully in auth
        // The profile will be created when they confirm their email
      } else {
        console.log('Profile created successfully');
      }

      // Step 3: If session is available, set user data (user is immediately logged in)
      if (data.session) {
        console.log('User is immediately logged in');
        setToken(data.session.access_token);
        const userProfile = await fetchUserProfile(data.session.user.id);
        if (userProfile) {
          setUser(userProfile);
        }
        setJustLoggedIn(true);
      } else {
        console.log('Email confirmation required - user will need to confirm email');
      }

      console.log('Registration process completed successfully');
    } catch (error: any) {
      console.error('Registration error:', error);
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

  const refreshUser = async () => {
    if (user?.id) {
      const userProfile = await fetchUserProfile(user.id);
      if (userProfile) {
        setUser(userProfile);
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
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
