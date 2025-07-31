// auth/src/components/signup/signupForm.tsx - VERSION PROGRESSIVE

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/src/components/landing-page/Button";
import { useSignup } from "@/context/signupContext";
import { useEnhancedAuth } from "@/context/authenticationContext";

interface PasswordCriteria {
  length: boolean;
  specialChar: boolean;
  uppercase: boolean;
  number: boolean;
}

interface UsernameCriteria {
  length: boolean;
  noSpaces: boolean;
  lowercase: boolean;
  notBanned: boolean;
}

interface FormData {
  username: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export default function SignUpForm() {
  const { signup, loading, error, success, clearError, clearSuccess } = useSignup();
  const { login, state: authState } = useEnhancedAuth();
  
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [acceptNewsletter, setAcceptNewsletter] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  
  const [passwordCriteria, setPasswordCriteria] = useState<PasswordCriteria>({
    length: false,
    specialChar: false,
    uppercase: false,
    number: false,
  });
  
  const [usernameCriteria, setUsernameCriteria] = useState<UsernameCriteria>({
    length: false,
    noSpaces: true,
    lowercase: true,
    notBanned: true,
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const bannedUsernames = ["admin", "root", "test", "null", "undefined"];

  // Nettoyer les erreurs lors des changements
  useEffect(() => {
    if (error) {
      clearError();
    }
    if (success) {
      clearSuccess();
    }
  }, [formData, clearError, clearSuccess]);

  // Gestion de la redirection après connexion automatique
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && registrationSuccess) {
      console.log('✅ [AUTH-SIGNUP] Inscription et connexion réussies, redirection vers dashboard...');
      
      setRedirectCountdown(3);
      
      const countdown = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdown);
            window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000/account';
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [authState.isAuthenticated, authState.user, registrationSuccess]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;

    if (field === "username") {
      // Convertir en minuscules et supprimer les espaces
      processedValue = value.toLowerCase().replace(/\s+/g, '');
      
      // Mise à jour des critères du nom d'utilisateur
      setUsernameCriteria({
        length: processedValue.length >= 4,
        noSpaces: !processedValue.includes(' '),
        lowercase: processedValue === processedValue.toLowerCase(),
        notBanned: !bannedUsernames.includes(processedValue.toLowerCase()),
      });
    }

    if (field === "email" || field === "confirmEmail") {
      processedValue = value.toLowerCase().trim();
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));

    if (field === "password") {
      setPasswordCriteria({
        length: value.length >= 8, // Ajusté à 8 pour plus de flexibilité
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
      });
    }

    // Progression automatique des étapes
    if (processedValue.trim()) {
      const fieldToStepMap: Record<keyof FormData, number> = {
        username: 1,
        email: 2,
        confirmEmail: 3,
        password: 4,
        confirmPassword: 5,
        firstName: 6,
        lastName: 6,
      };
      
      const nextStep = fieldToStepMap[field] + 1;
      setStep((prev) => Math.max(prev, nextStep));
    }
  };

  const validateFields = (): boolean => {
    const username = formData.username.trim().toLowerCase();

    if (!formData.username.trim() || formData.username.length < 4) {
      console.error("Validation error: Username too short");
      return false;
    }

    if (formData.username.includes(' ')) {
      console.error("Validation error: Username has spaces");
      return false;
    }

    if (bannedUsernames.includes(username)) {
      console.error("Validation error: Username is banned");
      return false;
    }

    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      console.error("Validation error: Invalid email");
      return false;
    }

    if (formData.email !== formData.confirmEmail) {
      console.error("Validation error: Emails don't match");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      console.error("Validation error: Passwords don't match");
      return false;
    }

    if (!passwordCriteria.length || !passwordCriteria.specialChar || !passwordCriteria.uppercase || !passwordCriteria.number) {
      console.error("Validation error: Password criteria not met");
      return false;
    }

    if (!acceptTerms) {
      console.error("Validation error: Terms not accepted");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 [DEBUG] Form data before validation:', formData);
    
    if (!validateFields()) {
      console.log('❌ [DEBUG] Client validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔄 [AUTH-SIGNUP] Tentative d\'inscription...');
      
      // Préparer les données normalisées
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        enabled: true,
        emailVerified: false,
      };

      console.log('🔍 [DEBUG] Data being sent:', {
        username: signupData.username,
        email: signupData.email,
        hasFirstName: !!signupData.firstName,
        hasLastName: !!signupData.lastName
      });
      
      // Étape 1: Inscription
      const signupResult = await signup(signupData);

      if (signupResult.success) {
        console.log('✅ [AUTH-SIGNUP] Inscription réussie, connexion automatique...');
        setRegistrationSuccess(true);
        
        // Étape 2: Connexion automatique après inscription
        const loginResult = await login({
          username: formData.username,
          password: formData.password,
        });

        if (loginResult.success) {
          console.log('✅ [AUTH-SIGNUP] Connexion automatique réussie');
        } else {
          console.warn('⚠️ [AUTH-SIGNUP] Échec connexion automatique, redirection manuelle');
          setRedirectCountdown(null);
          setRegistrationSuccess(false);
        }
      } else {
        console.error('❌ [AUTH-SIGNUP] Échec de l\'inscription');
        setRegistrationSuccess(false);
      }
    } catch (error: any) {
      console.error('❌ [AUTH-SIGNUP] Erreur d\'inscription:', error);
      setRegistrationSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Affichage du succès avec redirection
  if (registrationSuccess && authState.isAuthenticated && redirectCountdown !== null) {
    return (
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Inscription réussie !
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Bienvenue {formData.firstName} {formData.lastName} ({formData.username})
          </p>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
            <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium">
                Redirection vers le dashboard...
              </span>
            </div>
            <p className="text-xs text-blue-700">
              Redirection automatique dans {redirectCountdown} seconde{redirectCountdown !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000/account';
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Accéder maintenant au dashboard
          </button>
        </div>
      </div>
    );
  }

  // Affichage du succès d'inscription sans connexion automatique
  if (success && !authState.isAuthenticated) {
    return (
      <div className="text-center">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Inscription réussie !
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/signin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Se connecter maintenant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Créez votre compte</h1>
        <p className="text-gray-600 mt-2">Étape {Math.min(step, 6)} sur 6</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Étape 1: Nom d'utilisateur */}
          {step >= 1 && (
            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
                Nom d'utilisateur *
                <span className="text-xs text-gray-500 ml-2">
                  (converti automatiquement en minuscules)
                </span>
              </label>
              <input
                id="username"
                type="text"
                className="form-input w-full py-2 lowercase"
                placeholder="votre-nom-utilisateur"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
                disabled={loading || isSubmitting}
              />
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div className={usernameCriteria.length ? "text-green-600" : "text-gray-500"}>
                  ✓ Au moins 4 caractères
                </div>
                <div className={usernameCriteria.noSpaces ? "text-green-600" : "text-gray-500"}>
                  ✓ Pas d'espaces
                </div>
                <div className={usernameCriteria.notBanned ? "text-green-600" : "text-red-600"}>
                  ✓ Nom d'utilisateur disponible
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Email */}
          {step >= 2 && (
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Adresse email *
              </label>
              <input
                id="email"
                type="email"
                className="form-input w-full py-2"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={loading || isSubmitting}
              />
            </div>
          )}

          {/* Étape 3: Confirmation email */}
          {step >= 3 && (
            <div>
              <label htmlFor="confirmEmail" className="mb-1 block text-sm font-medium text-gray-700">
                Confirmer l'email *
              </label>
              <input
                id="confirmEmail"
                type="email"
                className="form-input w-full py-2"
                placeholder="Confirmez votre email"
                value={formData.confirmEmail}
                onChange={(e) => handleInputChange("confirmEmail", e.target.value)}
                required
                disabled={loading || isSubmitting}
              />
              {formData.email && formData.confirmEmail && formData.email !== formData.confirmEmail && (
                <p className="mt-1 text-sm text-red-600">Les emails ne correspondent pas</p>
              )}
            </div>
          )}

          {/* Étape 4: Mot de passe */}
          {step >= 4 && (
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="form-input w-full py-2"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                disabled={loading || isSubmitting}
              />
              <div className="mt-2 text-xs space-y-1">
                <div className={passwordCriteria.length ? "text-green-600" : "text-gray-500"}>
                  ✓ Au moins 8 caractères
                </div>
                <div className={passwordCriteria.specialChar ? "text-green-600" : "text-gray-500"}>
                  ✓ Au moins un caractère spécial
                </div>
                <div className={passwordCriteria.uppercase ? "text-green-600" : "text-gray-500"}>
                  ✓ Au moins une majuscule
                </div>
                <div className={passwordCriteria.number ? "text-green-600" : "text-gray-500"}>
                  ✓ Au moins un chiffre
                </div>
              </div>
            </div>
          )}

          {/* Étape 5: Confirmation mot de passe */}
          {step >= 5 && (
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                Confirmer le mot de passe *
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="form-input w-full py-2"
                placeholder="Confirmez votre mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                disabled={loading || isSubmitting}
              />
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Les mots de passe ne correspondent pas</p>
              )}
            </div>
          )}

          {/* Étape 6: Informations optionnelles */}
          {step >= 6 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="form-input w-full py-2"
                  placeholder="Votre prénom"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={loading || isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="form-input w-full py-2"
                  placeholder="Votre nom"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={loading || isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Conditions et newsletter */}
          {step >= 6 && (
            <>
              <div className="flex items-center justify-between mt-4">
                <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                  J'accepte les <Link href="/terms" className="text-blue-500 hover:underline">conditions d'utilisation</Link> *
                </label>
                <div
                  className={`relative w-12 h-6 ${acceptTerms ? "bg-green-500" : "bg-gray-300"} rounded-full cursor-pointer`}
                  onClick={() => setAcceptTerms(!acceptTerms)}
                >
                  <div
                    className={`absolute w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${acceptTerms ? "translate-x-6" : ""}`}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <label htmlFor="acceptNewsletter" className="text-sm text-gray-700">
                  S'inscrire à la newsletter
                </label>
                <div
                  className={`relative w-12 h-6 ${acceptNewsletter ? "bg-green-500" : "bg-gray-300"} rounded-full cursor-pointer`}
                  onClick={() => setAcceptNewsletter(!acceptNewsletter)}
                >
                  <div
                    className={`absolute w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${acceptNewsletter ? "translate-x-6" : ""}`}
                  ></div>
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {step >= 6 && (
          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || isSubmitting || !acceptTerms}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Inscription en cours...
                </span>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </div>
        )}
      </form>

      <div className="mt-6 text-center">
        Déjà inscrit ?{" "}
        <Link className="font-medium text-blue-600 underline hover:no-underline" href="/signin">
          Se connecter
        </Link>
      </div>
    </div>
  );
}