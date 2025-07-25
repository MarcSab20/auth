import { create } from 'zustand';

export interface Organization {
  organizationID: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Guest' | 'Member';
  icon: string;
}

interface OrganizationStore {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  currentOrganization: Organization | null;
  
  // Actions
  setOrganizations: (orgs: Organization[]) => void;
  setCurrentOrganization: (org: Organization | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Thunks
  fetchOrganizations: (userID: string) => Promise<void>;
  refreshOrganizations: (userID: string) => Promise<void>;
}

// Fonction utilitaire pour gérer les cookies
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

export const useOrganizationStore = create<OrganizationStore>()((set, get) => ({
  organizations: [],
  loading: false,
  error: null,
  currentOrganization: null,

  setOrganizations: (orgs) => {
    set({ organizations: orgs });
    // Stocker dans un cookie avec expiration de 1 heure
    setCookie('orgNav', JSON.stringify(orgs), 1/24);
  },

  setCurrentOrganization: (org) => set({ currentOrganization: org }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchOrganizations: async (userID) => {
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      // Fallback rapide via cookie si dispo
      const cachedOrgs = getCookie('orgNav');
      if (cachedOrgs) {
        try {
          const fallback = JSON.parse(cachedOrgs);
          set({ organizations: fallback });
        } catch (e) {
          // Si le cookie est corrompu, on le supprime
          document.cookie = 'orgNav=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        }
      }

      // Requête vers l'API
      const res = await fetch(`/api/user/${userID}/organizations`);
      if (!res.ok) throw new Error('Échec de la récupération des organisations');
      
      const data = await res.json();
      set({ organizations: data });
      // Mettre à jour le cookie
      setCookie('orgNav', JSON.stringify(data), 1/24);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Une erreur est survenue' });
    } finally {
      set({ loading: false });
    }
  },

  refreshOrganizations: async (userID) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/user/${userID}/organizations`);
      if (!res.ok) throw new Error('Échec de la récupération des organisations');
      
      const data = await res.json();
      set({ organizations: data });
      // Mettre à jour le cookie
      setCookie('orgNav', JSON.stringify(data), 1/24);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Une erreur est survenue' });
    } finally {
      set({ loading: false });
    }
  },
})); 