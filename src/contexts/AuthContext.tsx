'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSession,
  setSession,
  clearSession,
  UserSession,
  getUserRole,
  isAdminOrDispatcher as checkIsAdminOrDispatcher,
  isContractor as checkIsContractor,
  isCustomer as checkIsCustomer,
} from '@/lib/auth';
import { api, handleApiError } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: UserSession['user'] | null;
  contractorProfile: UserSession['contractor_profile'] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: 'admin' | 'dispatcher' | 'contractor' | 'customer' | null;
  isAdminOrDispatcher: boolean;
  isContractor: boolean;
  isCustomer: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession['user'] | null>(null);
  const [contractorProfile, setContractorProfile] = useState<UserSession['contractor_profile'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from stored session
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session.user);
      setContractorProfile(session.contractor_profile || null);
    }
    setIsLoading(false);
  }, []);

  // Listen for Supabase auth state changes (catches direct signIn from AuthModal)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sbSession) => {
        if (event === 'SIGNED_IN' && sbSession?.user && !user) {
          // A Supabase session appeared but we don't have a local user yet
          // Create a local session from the Supabase session
          const role = (sbSession.user.user_metadata?.role as UserSession['user']['role']) || 'customer';
          const sessionData: UserSession = {
            user: {
              id: sbSession.user.id,
              email: sbSession.user.email || '',
              role: role,
              status: 'active',
            },
            session: {
              access_token: sbSession.access_token,
              refresh_token: sbSession.refresh_token,
              expires_at: sbSession.expires_at,
            },
          };
          setSession(sessionData);
          setUser(sessionData.user);
        } else if (event === 'SIGNED_OUT') {
          clearSession();
          setUser(null);
          setContractorProfile(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [user]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post<{
        user: UserSession['user'];
        session: UserSession['session'];
        contractor_profile?: UserSession['contractor_profile'];
      }>('/api/auth/login', { email, password });

      if (response.success && response.data) {
        const sessionData: UserSession = {
          user: response.data.user,
          session: response.data.session,
          contractor_profile: response.data.contractor_profile,
        };

        setSession(sessionData);
        setUser(sessionData.user);
        setContractorProfile(sessionData.contractor_profile || null);

        // Also set the Supabase client session so auth.uid() works for RLS
        if (response.data.session?.access_token && response.data.session?.refresh_token) {
          await supabase.auth.setSession({
            access_token: response.data.session.access_token,
            refresh_token: response.data.session.refresh_token,
          });
        }

        return { success: true };
      }

      return { success: false, error: response.error || 'Bejelentkezés sikertelen' };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch {
      // Ignore logout errors
    } finally {
      clearSession();
      setUser(null);
      setContractorProfile(null);
    }
  }, []);

  // Refresh session from server
  const refreshSession = useCallback(async () => {
    try {
      const response = await api.get<{
        authenticated: boolean;
        user?: UserSession['user'];
        session?: UserSession['session'];
        contractor_profile?: UserSession['contractor_profile'];
      }>('/api/auth/session');

      if (response.success && response.data?.authenticated && response.data.user) {
        const currentSession = getSession();
        if (currentSession) {
          const sessionData: UserSession = {
            user: response.data.user,
            session: response.data.session || currentSession.session,
            contractor_profile: response.data.contractor_profile,
          };

          setSession(sessionData);
          setUser(sessionData.user);
          setContractorProfile(sessionData.contractor_profile || null);
        }
      } else {
        clearSession();
        setUser(null);
        setContractorProfile(null);
      }
    } catch {
      // Session refresh failed, but don't clear - might be network issue
    }
  }, []);

  const role = user?.role || null;

  const value: AuthContextType = {
    user,
    contractorProfile,
    isLoading,
    isAuthenticated: user !== null,
    role,
    isAdminOrDispatcher: role === 'admin' || role === 'dispatcher',
    isContractor: role === 'contractor',
    isCustomer: role === 'customer',
    login,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
