// /src/context/dashboardContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/authenticationContext';
import { useOrganizationStore } from '../src/store/organizationStore';

export interface NavItem {
  organizationID: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Guest' | 'Member';
  icon: string;
}

interface DashboardContextType {
  organizationNav: NavItem[];
  loadingOrganizations: boolean;
  refreshOrganizations: () => void;
}

const DashboardContext = createContext<DashboardContextType>({
  organizationNav: [],
  loadingOrganizations: false,
  refreshOrganizations: () => {},
});

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { organizations, loading, error, fetchOrganizations } = useOrganizationStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.userID) {
      fetchOrganizations(user.userID);
    }
  }, [user?.userID, fetchOrganizations]);

  return (
    <DashboardContext.Provider value={{
      organizationNav: organizations,
      loadingOrganizations: loading,
      refreshOrganizations: () => user?.userID && fetchOrganizations(user.userID),
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => useContext(DashboardContext);
