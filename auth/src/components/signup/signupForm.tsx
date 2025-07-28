// auth/src/components/signup/signupForm.tsx (version modifiée)
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/src/components/landing-page/Button";
import { useSignup } from "@/context/signupContext";
import { useEnhancedAuth } from "@/context/authenticationContext";

export default function SignUpForm() {
  const { signup, loading, error, success, clearError, clearSuccess } = useSignup();
  const { login, state: authState } = useEnhancedAuth();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    acceptTerms: false,
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Nettoyer les erreurs lors des changements
  useEffect(() => {
    if (error) {
      clearError();
    }
    if (success) {
      clearSuccess();
    }
  }, [formData, clearError, clearSuccess]);

  // Gestion de la redirection après connexion automatique post-inscription
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && registrationSuccess) {
      console.log('✅ [AUTH-SIGNUP] Inscription et connexion réussies, redirection vers dashboard...');
      
      // Démarrer le compte à rebours
      setRedirectCountdown(3);
      
      const countdown = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdown);
            // Redirection vers le dashboard
            window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000/account';
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [authState.isAuthenticated, authState.user, registrationSuccess]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validation username
    if (!formData.username.trim()) {
      errors.username = "Le nom d'utilisateur est requis";
    } else if (formData.username.length < 4) {
      errors.username = "Le nom d'utilisateur doit contenir au moins 4 caractères";
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    // Validation password
    if (!formData.password) {
      errors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    // Validation confirm password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    // Validation terms
    if (!formData.acceptTerms) {
      errors.acceptTerms = "Vous devez accepter les conditions d'utilisation";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔄 [AUTH-SIGNUP] Tentative d\'inscription...');
      
      // Étape 1: Inscription
      const signupResult = await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        enabled: true,
        emailVerified: false,
      });

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
          // La redirection sera gérée par l'useEffect
        } else {
          console.warn('⚠️ [AUTH-SIGNUP] Échec connexion automatique, redirection manuelle');
          // Afficher un message pour connexion manuelle
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Nettoyer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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

          <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">
              🎉 Votre compte a été créé avec succès !
            </h4>
            <ul className="text-xs text-green-700 space-y-1 text-left">
              <li>• Nom d'utilisateur: {formData.username}</li>
              <li>• Email: {formData.email}</li>
              <li>• Connexion automatique activée</li>
              <li>• Accès au dashboard en cours...</li>
            </ul>
          </div>

          <button
            onClick={() => {
              window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000/account';
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Accéder maintenant au dashboard
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Nom et Prénom */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className="mb-1 block text-sm font-medium text-gray-700"
                htmlFor="firstName"
              >
                Prénom
              </label>
              <input
                id="firstName"
                name="firstName"
                className="form-input w-full py-2"
                type="text"
                placeholder="Votre prénom"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading || isSubmitting}
              />
            </div>
            <div>
              <label
                className="mb-1 block text-sm font-medium text-gray-700"
                htmlFor="lastName"
              >
                Nom
              </label>
              <input
                id="lastName"
                name="lastName"
                className="form-input w-full py-2"
                type="text"
                placeholder="Votre nom"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading || isSubmitting}
              />
            </div>
          </div>

          {/* Nom d'utilisateur */}
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="username"
            >
              Nom d'utilisateur *
            </label>
            <input
              id="username"
              name="username"
              className={`form-input w-full py-2 ${validationErrors.username ? 'border-red-500' : ''}`}
              type="text"
              placeholder="Votre nom d'utilisateur"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading || isSubmitting}
            />
            {validationErrors.username && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Adresse email *
            </label>
            <input
              id="email"
              name="email"
              className={`form-input w-full py-2 ${validationErrors.email ? 'border-red-500' : ''}`}
              type="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading || isSubmitting}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Mot de passe *
            </label>
            <input
              id="password"
              name="password"
              className={`form-input w-full py-2 ${validationErrors.password ? 'border-red-500' : ''}`}
              type="password"
              placeholder="Votre mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading || isSubmitting}
            />
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="confirmPassword"
            >
              Confirmer le mot de passe *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input w-full py-2 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
              type="password"
              placeholder="Confirmez votre mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading || isSubmitting}
            />
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Acceptation des conditions */}
          <div className="flex items-start">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${validationErrors.acceptTerms ? 'border-red-500' : ''}`}
              checked={formData.acceptTerms}
              onChange={handleChange}
              disabled={loading || isSubmitting}
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
              J'accepte les{" "}
              <Link href="/terms" className="text-blue-600 underline hover:no-underline">
                conditions d'utilisation
              </Link>{" "}
              et la{" "}
              <Link href="/privacy" className="text-blue-600 underline hover:no-underline">
                politique de confidentialité
              </Link>
              {" "}*
            </label>
          </div>
          {validationErrors.acceptTerms && (
            <p className="text-sm text-red-600">{validationErrors.acceptTerms}</p>
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

        <div className="mt-6">
          <Button
            type="submit"
            className="w-full"
            disabled={loading || isSubmitting || !formData.acceptTerms}
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