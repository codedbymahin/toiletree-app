import React, { createContext, useState, useContext, useEffect } from 'react';
import { Profile } from '../types';
import { authService } from '../services/auth';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    checkUser();

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadUserProfile();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    setLoading(true);
    await loadUserProfile();
    setLoading(false);
  };

  const loadUserProfile = async () => {
    const { profile, error } = await authService.getCurrentUser();
    if (profile && !error) {
      setUser(profile);
    } else {
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { user: authUser, error } = await authService.signIn(email, password);
    if (!error && authUser) {
      await loadUserProfile();
    }
    return { error };
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { user: authUser, error } = await authService.signUp(
      email,
      password,
      username
    );
    if (!error && authUser) {
      await loadUserProfile();
    }
    return { error };
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    await loadUserProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

