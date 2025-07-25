'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSharedSession } from '@/src/hooks/useSharedSession';

interface SessionContextValue {
  session: any;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const {
    session,
    isLoading,
    error,
    refreshSession,
    checkSession
  } = useSharedSession();

  const contextValue: SessionContextValue = {
    session,
    isLoading,
    error,
    isAuthenticated: session?.isAuthenticated || false,
    refreshSession,
    checkSession
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
}