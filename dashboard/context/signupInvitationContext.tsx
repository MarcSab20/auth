"use client";
import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

export interface SignupInvitationFormData {
  name: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface SignupInvitationContextType {
  signupInvitation: (
    data: SignupInvitationFormData,
    acceptNewsletter: boolean,
    organizationID: string
  ) => Promise<void>;
  error: string | null;
  success: string | null;
  loading: boolean;
}

const SignupInvitationContext = createContext<SignupInvitationContextType | undefined>(undefined);

export const SignupInvitationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const signupInvitation = async (
    data: SignupInvitationFormData,
    acceptNewsletter: boolean,
    organizationID: string
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

      // 3) Ajout de l'utilisateur à l'organisation
      const orgRes = await fetch(`/api/organization/${organizationID}/members/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: userData.userID }),
      });

      if (!orgRes.ok) {
        // Rollback de l'utilisateur et du profil
        await fetch(`/api/profile/${profileData.profileID}/delete`, {
          method: "DELETE",
        }).catch(() => {});
        throw new Error("Impossible de rejoindre l'organisation.");
      }

      // 4) Création du contact newsletter (si accepté)
      if (acceptNewsletter) {
        await fetch("/api/newsletter/contact/new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            userID: userData.userID,
            isNewsletterSubscriber: true,
            source: "signup_invitation",
          }),
        }).catch(() => {}); // On ignore les erreurs de newsletter
      }

      // 5) Succès + redirection
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
    <SignupInvitationContext.Provider value={{ signupInvitation, error, success, loading }}>
      {children}
    </SignupInvitationContext.Provider>
  );
};

export const useSignupInvitation = () => {
  const context = useContext(SignupInvitationContext);
  if (!context) throw new Error("useSignupInvitation must be used within SignupInvitationProvider");
  return context;
}; 