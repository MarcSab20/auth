// auth/src/components/signup/signupForm.tsx - VERSION PROGRESSIVE SIMPLIFIÉE
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/src/components/landing-page/Button";
import { useSignup } from "@/context/signupContext";
import { useEnhancedAuth } from "@/context/authenticationContext";
import AuthPageHeader from "@/src/components/auth/AuthPageHeader";
import AuthErrorDisplay from "@/src/components/auth/AuthErrorDisplay";
import AuthSuccessDisplay from "@/src/components/auth/AuthSuccessDisplay";
import AuthLoadingDisplay from "@/src/components/auth/AuthLoadingDisplay";

interface PasswordCriteria {
  length: boolean;
  specialChar: boolean;
  uppercase: boolean;
  number: boolean;
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
  
  const [currentStep, setCurrentStep] = useState<number>(1);
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

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const bannedUsernames = ["admin", "root", "test", "null", "undefined"];

  // Nettoyer les erreurs lors des changements
  useEffect(() => {
    if (error) clearError();
    if (success) clearSuccess();
  }, [formData, clearError, clearSuccess]);

  // Gestion de la redirection après connexion automatique
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && registrationSuccess) {
      console.log('✅ [SIGNUP] Inscription et connexion réussies, redirection vers dashboard...');
      
      setRedirectCountdown(3);
      
      const countdown = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdown);
            window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002/account';
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [authState.isAuthenticated, authState.user, registrationSuccess]);

  const validateField = (field: keyof FormData, value: string): string | null => {
    switch (field) {
      case 'username':
        if (value.length < 3) return 'Au moins 3 caractères requis';
        if (/\s/.test(value)) return 'Pas d\'espaces autorisés';
        if (bannedUsernames.includes(value.toLowerCase())) return 'Nom d\'utilisateur réservé';
        return null;
        
      case 'email':
        if (!emailRegex.test(value)) return 'Format d\'email invalide';
        return null;
        
      case 'confirmEmail':
        if (value !== formData.email) return 'Les emails ne correspondent pas';
        return null;
        
      case 'password':
        if (value.length < 8) return 'Au moins 8 caractères requis';
        if (!/[A-Z]/.test(value)) return 'Au moins une majuscule';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Au moins un caractère spécial';
        if (!/[0-9]/.test(value)) return 'Au moins un chiffre';
        return null;
        
      case 'confirmPassword':
        if (value !== formData.password) return 'Les mots de passe ne correspondent pas';
        return null;
        
      default:
        return null;
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;

    if (field === "username") {
      processedValue = value.toLowerCase().replace(/\s+/g, '');
    }
    if (field === "email" || field === "confirmEmail") {
      processedValue = value.toLowerCase().trim();
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));

    // Validation en temps réel
    const validationError = validateField(field, processedValue);
    setValidationErrors(prev => ({
      ...prev,
      [field]: validationError || ''
    }));

    // Mise à jour des critères de mot de passe
    if (field === "password") {
      setPasswordCriteria({
        length: value.length >= 8,
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
      });
    }

    // Progression automatique des étapes
    if (processedValue.trim() && !validationError) {
      if (field === 'username' && currentStep === 1) {
        setCurrentStep(2);
      } else if (field === 'email' && currentStep === 2) {
        setCurrentStep(3);
      } else if (field === 'confirmEmail' && currentStep === 3 && processedValue === formData.email) {
        setCurrentStep(4);
      } else if (field === 'password' && currentStep === 4 && !validateField('password', processedValue)) {
        setCurrentStep(5);
      } else if (field === 'confirmPassword' && currentStep === 5 && processedValue === formData.password) {
        setCurrentStep(6);
      }
    }
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    
    Object.keys(formData).forEach(key => {
      const field = key as keyof FormData;
      const value = formData[field] || '';
      const error = validateField(field, value);
      if (error) errors[field] = error;
    });

    if (!acceptTerms) {
      errors.terms = 'Vous devez accepter les conditions d\'utilisation';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔄 [SIGNUP] Tentative d\'inscription...');
      
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        enabled: true,
        emailVerified: false,
      };

      const signupResult = await signup(signupData);

      if (signupResult.success) {
        console.log('✅ [SIGNUP] Inscription réussie, connexion automatique...');
        setRegistrationSuccess(true);
        
        const loginResult = await login({
          username: formData.username,
          password: formData.password,
        });

        if (loginResult.success) {
          console.log('✅ [SIGNUP] Connexion automatique réussie');
        } else {
          console.warn('⚠️ [SIGNUP] Échec connexion automatique');
          setRedirectCountdown(null);
          setRegistrationSuccess(false);
        }
      } else {
        console.error('❌ [SIGNUP] Échec de l\'inscription');
        setRegistrationSuccess(false);
      }
    } catch (error: any) {
      console.error('❌ [SIGNUP] Erreur d\'inscription:', error);
      setRegistrationSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Affichage du succès avec redirection
  if (registrationSuccess && authState.isAuthenticated && redirectCountdown !== null) {
    return (
      <AuthSuccessDisplay
        title="Inscription réussie !"
        message={`Bienvenue ${formData.firstName} ${formData.lastName}`}
        actionText="Accéder maintenant au dashboard"
        actionOnClick={() => {
          window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002/account';
        }}
        countdown={redirectCountdown}
      />
    );
  }

  // Affichage du succès sans connexion automatique
  if (success && !authState.isAuthenticated) {
    return (
      <AuthSuccessDisplay
        title="Inscription réussie !"
        message="Votre compte a été créé avec succès."
        actionText="Se connecter maintenant"
        actionHref="/signin"
      />
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <AuthPageHeader 
        title="Créez votre compte"
        subtitle={`Étape ${currentStep} sur 6`}
      />

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Étape 1: Nom d'utilisateur */}
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                className={`form-input w-full py-2 ${validationErrors.username ? 'border-red-300' : ''}`}
                placeholder="votre-nom-utilisateur"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
                disabled={loading || isSubmitting}
              />
              {validationErrors.username && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
              )}
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div className={formData.username.length >= 3 ? "text-green-600" : "text-gray-500"}>
                  ✓ Au moins 3 caractères
                </div>
                <div className={!formData.username.includes(' ') ? "text-green-600" : "text-gray-500"}>
                  ✓ Pas d'espaces
                </div>
                <div className={!bannedUsernames.includes(formData.username.toLowerCase()) ? "text-green-600" : "text-red-600"}>
                  ✓ Nom d'utilisateur disponible
                </div>
              </div>
            </div>

            {/* Étape 2: Email */}
            {currentStep >= 2 && (
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-input w-full py-2 ${validationErrors.email ? 'border-red-300' : ''}`}
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  disabled={loading || isSubmitting}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>
            )}

            {/* Étape 3: Confirmation email */}
            {currentStep >= 3 && (
              <div>
                <label htmlFor="confirmEmail" className="mb-1 block text-sm font-medium text-gray-700">
                  Confirmer l'email
                </label>
                <input
                  id="confirmEmail"
                  type="email"
                  className={`form-input w-full py-2 ${validationErrors.confirmEmail ? 'border-red-300' : ''}`}
                  placeholder="Confirmez votre email"
                  value={formData.confirmEmail}
                  onChange={(e) => handleInputChange("confirmEmail", e.target.value)}
                  required
                  disabled={loading || isSubmitting}
                />
                {validationErrors.confirmEmail && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.confirmEmail}</p>
                )}
              </div>
            )}

            {/* Étape 4: Mot de passe */}
            {currentStep >= 4 && (
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className={`form-input w-full py-2 ${validationErrors.password ? 'border-red-300' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  disabled={loading || isSubmitting}
                />
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                )}
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
            {currentStep >= 5 && (
              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={`form-input w-full py-2 ${validationErrors.confirmPassword ? 'border-red-300' : ''}`}
                  placeholder="Confirmez votre mot de passe"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  disabled={loading || isSubmitting}
                />
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Étape 6: Informations optionnelles */}
            {currentStep >= 6 && (
              <div className="space-y-4">
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

                {/* Conditions et newsletter */}
                <div className="flex items-center justify-between mt-4">
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                    J'accepte les <Link href="/terms" className="text-blue-500 hover:underline">conditions d'utilisation</Link>
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
                {validationErrors.terms && (
                  <p className="text-red-500 text-sm">{validationErrors.terms}</p>
                )}

                <div className="flex items-center justify-between">
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
              </div>
            )}
          </div>

          <AuthErrorDisplay error={error} />

          {currentStep >= 6 && (
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
                    Création du compte...
                  </span>
                ) : (
                  "Créer mon compte"
                )}
              </Button>
            </div>
          )}
        </div>
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