import { useEffect } from 'react';
import { useAuth } from '@/context/authenticationContext';
import { useOrganizationStore } from '@/src/store/organizationStore';

export function useOrganizations() {
  const { user } = useAuth();
  const {
    organizations,
    loading,
    error,
    currentOrganization,
    fetchOrganizations,
    refreshOrganizations,
    setCurrentOrganization,
  } = useOrganizationStore();

  useEffect(() => {
    if (user?.userID) {
      fetchOrganizations(user.userID);
    }
  }, [user?.userID, fetchOrganizations]);

  return {
    organizations,
    loading,
    error,
    currentOrganization,
    setCurrentOrganization,
    refreshOrganizations: () => user?.userID && refreshOrganizations(user.userID),
  };
} 