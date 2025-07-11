"use client";
import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { SignupInvitationFormData } from "@/types/waitingListSignup";

interface WaitingListSignupContextType {
  signupWaitingList: (
    data: SignupInvitationFormData,
    acceptNewsletter: boolean,
    waitingListID: string
  ) => Promise<void>;
  error: string | null;
  success: string | null;
  loading: boolean;
}

const WaitingListSignupContext = createContext<WaitingListSignupContextType | undefined>(undefined);

export function WaitingListSignupProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const signupWaitingList = async (
    data: SignupInvitationFormData,
    acceptNewsletter: boolean,
    waitingListID: string
  ) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Vérification du mot de passe côté client
      if (data.password !== data.confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas.");
      }

      // 1) Création du profil avec firstName et lastName
      const profileRes = await fetch("/api/profile/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          authorID: "1", 
          state: "online",
          firstName: data.firstName,
          lastName: data.lastName
        }),
      });

      if (!profileRes.ok) {
        throw new Error("Impossible de créer votre profil.");
      }

      const profileData = await profileRes.json();

      // 2) Création de l'utilisateur
      const userRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.name,
          email: data.email,
          password: data.password,
          profileID: profileData.profileID,
          userKind: "client",
          state: "online",
          twoFactorEnabled: false,
          rsaPublicKey: "",
        }),
      });

      if (!userRes.ok) {
        // Rollback du profil
        await fetch(`/api/profile/${profileData.profileID}/delete`, {
          method: "DELETE",
        }).catch(() => {});
        throw new Error("Impossible de créer votre compte.");
      }

      const userData = await userRes.json();

      // 3) Création du contact newsletter (si accepté)
      if (acceptNewsletter) {
        await fetch("/api/newsletter/contact/new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            userID: userData.userID,
            isNewsletterSubscriber: true,
            source: "waiting_list",
          }),
        }).catch(() => {}); // On ignore les erreurs de newsletter
      }

      // 4) Succès + redirection
      setSuccess("Inscription réussie ! Vous allez être redirigé…");
      setTimeout(() => router.push("/signin"), 2000);

    } catch (err) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WaitingListSignupContext.Provider value={{ signupWaitingList, error, success, loading }}>
      {children}
    </WaitingListSignupContext.Provider>
  );
}

export function useWaitingListSignup() {
  const context = useContext(WaitingListSignupContext);
  if (context === undefined) {
    throw new Error('useWaitingListSignup must be used within a WaitingListSignupProvider');
  }
  return context;
}
