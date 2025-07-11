// context/signupContext.tsx - VERSION CORRIGÉE POUR KRAKEND
"use client";
import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

export interface SignupFormData {
  name: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
}

interface SignupContextType {
  signup: (
    data: SignupFormData,
    acceptNewsletter: boolean,
    organizationID?: string
  ) => Promise<boolean>; // CHANGER LE TYPE DE RETOUR
  error: string | null;
  success: string | null;
  loading: boolean;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export const SignupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const signup = async (
    data: SignupFormData,
    acceptNewsletter: boolean,
    organizationID?: string
  ): Promise<boolean> => {
    console.log('=== SIGNUP CONTEXT START ===');
    console.log('Data received:', data);
    console.log('Newsletter:', acceptNewsletter);
    console.log('Organization ID:', organizationID);

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // UTILISER L'API KRAKEND DIRECTEMENT
      const signupPayload = {
        username: data.name,
        email: data.email,
        password: data.password,
        firstName: data.name, // Ou extraire le prénom si nécessaire
        lastName: 'User'      // Ou extraire le nom si nécessaire
      };

      console.log('Calling KrakenD signup API with payload:', signupPayload);

      const response = await fetch('http://localhost:8090/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(signupPayload),
      });

      console.log('KrakenD response status:', response.status);
      console.log('KrakenD response headers:', [...response.headers.entries()]);

      const responseText = await response.text();
      console.log('KrakenD raw response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        setError('Erreur de format de réponse du serveur');
        setLoading(false);
        return false;
      }

      if (!response.ok) {
        console.error('Signup failed with status:', response.status);
        console.error('Error response:', responseData);
        
        const errorMessage = responseData?.message || 
                            responseData?.error || 
                            `Erreur ${response.status}: ${response.statusText}`;
        
        setError(errorMessage);
        setLoading(false);
        return false;
      }

      console.log('Signup successful!', responseData);

      // Newsletter handling (optionnel - peut être fait plus tard)
      if (acceptNewsletter) {
        try {
          console.log('Attempting newsletter subscription...');
          // Vous pouvez implémenter cela plus tard ou via une autre API
          // Pour l'instant, on ignore les erreurs de newsletter
        } catch (newsletterError) {
          console.warn('Newsletter subscription failed:', newsletterError);
          // Ne pas faire échouer l'inscription pour la newsletter
        }
      }

      // Succès
      setSuccess("Inscription réussie ! Vous allez être redirigé vers la connexion...");
      setLoading(false);
      
      // Redirection après un délai
      setTimeout(() => {
        router.push("/signin");
      }, 2000);

      return true;

    } catch (networkError) {
      console.error('Network error during signup:', networkError);
      setError('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
      setLoading(false);
      return false;
    }
  };

  return (
    <SignupContext.Provider value={{ signup, error, success, loading }}>
      {children}
    </SignupContext.Provider>
  );
};

export const useSignup = () => {
  const context = useContext(SignupContext);
  if (!context) throw new Error("useSignup must be used within SignupProvider");
  return context;
};