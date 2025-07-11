'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SMPUser {
  userID: string;
  username: string;
  email: string;
  profileID: string;
  accessibleOrganizations?: string[];
}

export interface AuthContextProps {
  isLoggedIn: boolean;
  user: SMPUser | null;
  authLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  getUserID: () => string | null;
  updateUser: (updates: Partial<SMPUser>) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SMPUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("smp_user_0");
    if (storedUser) {
      try {
        const parsedUser: SMPUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem("smp_user_0");
      }
    }
    setAuthLoading(false);
  }, []);

  const saveUserToStorage = (data: SMPUser | null) => {
    if (data) {
      localStorage.setItem("smp_user_0", JSON.stringify(data));
      document.cookie = `smp_user_0=${encodeURIComponent(JSON.stringify(data))}; path=/`;
    } else {
      localStorage.removeItem("smp_user_0");
      document.cookie = `smp_user_0=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const loginResponse = await response.json();

      if (!loginResponse?.user) {
        return { success: false, message: "Identifiants invalides." };
      }

      const userData = loginResponse.user;

      // Récupérer les organizations de l'utilisateur
      const res = await fetch(`/api/user/${userData.userID}/organizations`);
      const orgs = await res.json();
      const accessibleOrgIDs = Array.isArray(orgs)
        ? orgs.map((o: any) => o.organizationID)
        : [];

      const enrichedUser: SMPUser = {
        userID: userData.userID,
        username: userData.username,
        email: userData.email,
        profileID: userData.profileID,
        accessibleOrganizations: accessibleOrgIDs,
      };

      setUser(enrichedUser);
      saveUserToStorage(enrichedUser);

      return { success: true };
    } catch (error) {
      console.error("Erreur login:", error);
      return { success: false, message: "Erreur serveur. Veuillez réessayer." };
    }
  };

  const logout = async () => {
    try {
      // Appel de la route API /api/logout pour supprimer le cookie côté serveur
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Erreur lors du logout :", error);
    } finally {
      setUser(null);
      saveUserToStorage(null);
      localStorage.removeItem("orgFormData");
      localStorage.removeItem("serviceFormData");
      // Nettoyer d'autres données locales ou contextes si nécessaire
      window.location.href = "/signin";
    }
  };

  const getUserID = () => user?.userID ?? null;

  const updateUser = (updates: Partial<SMPUser>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn: !!user, 
      user, 
      authLoading, 
      login, 
      logout, 
      getUserID,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
