import React, { createContext, useContext, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { useAuthStore, type AuthResult } from '../store/authStore';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    session, 
    user, 
    loading, 
    signUp, 
    signIn, 
    signOut, 
    forgotPassword,
    initializeAuth 
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signUp, 
      signIn, 
      signOut, 
      forgotPassword 
    }}>
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