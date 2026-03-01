'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, AuthResponse, User } from '@/lib/api/auth';
import { tokenStorage } from '@/lib/utils/token';
import { track } from '@/lib/analytics';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string, country?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (error) {
      tokenStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response: AuthResponse = await authApi.signIn({ email, password });
    tokenStorage.setAccessToken(response.access_token);
    tokenStorage.setRefreshToken(response.refresh_token);
    setUser({
      userId: response.user.id,
      email: response.user.email,
      email_verified: response.user.email_verified,
    });
    router.push('/dashboard');
  };

  const signup = async (email: string, password: string, name?: string, country?: string) => {
    const response: AuthResponse = await authApi.signUp({ email, password, name, country });
    tokenStorage.setAccessToken(response.access_token);
    tokenStorage.setRefreshToken(response.refresh_token);
    setUser({
      userId: response.user.id,
      email: response.user.email,
      email_verified: response.user.email_verified,
    });
    const { toast } = await import('sonner');
    toast.success('Account created! Please check your email to verify your account.', {
      duration: 5000,
    });
    track('onboarding_wizard_started');
    router.push('/onboarding');
  };

  const logout = () => {
    tokenStorage.clearTokens();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
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
