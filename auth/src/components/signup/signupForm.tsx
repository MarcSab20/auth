// src/components/signup/signupForm.tsx 
"use client";

import { useState, useEffect } from "react";
import { useSignup } from "@/context/signupContext"; 
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpForm() {
  const { signup, error, success, loading } = useSignup(); 
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [acceptNewsletter, setAcceptNewsletter] = useState<boolean>(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Validation du mot de passe en temps réel
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    specialChar: false,
    uppercase: false,
    number: false,
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === "name") {
      value = value.toLowerCase().replace(/\s+/g, '');
    }

    setFormData(prev => ({ ...prev, [field]: value }));

    // Validation de mot de passe en temps réel
    if (field === "password") {
      setPasswordCriteria({
        length: value.length >= 12,
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
      });
    }

    // Validation de confirmation d'email
    if (field === 'confirmEmail' || (field === 'email' && formData.confirmEmail)) {
      const emailToCheck = field === 'email' ? value : formData.email;
      const confirmToCheck = field === 'confirmEmail' ? value : formData.confirmEmail;
      
      if (emailToCheck !== confirmToCheck) {
        setLocalErrors(prev => ({ ...prev, confirmEmail: "Les emails ne correspondent pas" }));
      } else {
        setLocalErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmEmail;
          return newErrors;
        });
      }
    }

    // Validation de confirmation de mot de passe
    if (field === 'confirmPassword' || (field === 'password' && formData.confirmPassword)) {
      const passwordToCheck = field === 'password' ? value : formData.password;
      const confirmToCheck = field === 'confirmPassword' ? value : formData.confirmPassword;
      
      if (passwordToCheck !== confirmToCheck) {
        setLocalErrors(prev => ({ ...prev, confirmPassword: "Les mots de passe ne correspondent pas" }));
      } else {
        setLocalErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }

    // Avancer les étapes automatiquement
    if (value.trim()) {
      if (field === "name") {
        setStep(prev => Math.max(prev, 2));
      } else if (field === "email") {
        setStep(prev => Math.max(prev, 3));
      } else if (field === "confirmEmail") {
        setStep(prev => Math.max(prev, 4));
      } else if (field === "password") {
        setStep(prev => Math.max(prev, 5));
      }
    }
  };

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.length < 4) {
      errors.name = "Le nom d'utilisateur doit contenir au moins 4 caractères.";
    }

    if (formData.name.includes(' ')) {
      errors.name = "Le nom d'utilisateur ne doit pas contenir d'espaces.";
    }

    const bannedUsernames = ['admin', 'root', 'test', 'null', 'undefined'];
    if (bannedUsernames.includes(formData.name.toLowerCase())) {
      errors.name = "Ce nom d'utilisateur est réservé.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Format d'email invalide.";
    }

    if (formData.email !== formData.confirmEmail) {
      errors.confirmEmail = "Les emails ne correspondent pas.";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    if (!passwordCriteria.length || !passwordCriteria.specialChar || !passwordCriteria.uppercase || !passwordCriteria.number) {
      errors.password = "Le mot de passe doit respecter tous les critères de sécurité.";
    }

    if (!acceptTerms) {
      errors.terms = "Vous devez accepter les conditions d'utilisation.";
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== SIGNUP FORM DEBUG ===');
    console.log('Form data:', formData);
    console.log('Validation result:', validateFields());
    console.log('Context available:', !!signup);
    
    if (!validateFields()) {
      console.log('Validation failed:', localErrors);
      return;
    }

    try {
      console.log('Calling signup with data:', {
        name: formData.name,
        email: formData.email,
        confirmEmail: formData.confirmEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      // UTILISER LE CONTEXTE SIMPLE
      await signup({
        name: formData.name,
        email: formData.email,
        confirmEmail: formData.confirmEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }, acceptNewsletter);

      console.log('Signup completed successfully');

    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        router.push("/signin");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [success, router]);

  // DEBUG: Afficher l'état du contexte
  useEffect(() => {
    console.log('=== SIGNUP CONTEXT STATE ===');
    console.log('signup function:', typeof signup);
    console.log('loading:', loading);
    console.log('error:', error);
    console.log('success:', success);
  }, [signup, loading, error, success]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {step >= 1 && (
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Nom d'utilisateur
            </label>
            <input
              id="name"
              type="text"
              placeholder="johndoe"
              className="form-input w-full py-2 lowercase"
              value={formData.name}
              required
              onChange={(e) => handleInputChange("name", e.target.value.toLowerCase())}
            />
            {localErrors.name && (
              <p className="text-red-500 text-sm mt-1">{localErrors.name}</p>
            )}
            <ul className="mt-2 text-sm text-gray-700">
              <li className={`flex items-center ${formData.name.length >= 4 ? "text-green-500" : ""}`}>
                <span className="mr-2">✔</span> Au moins 4 caractères
              </li>
              <li className={`flex items-center ${!formData.name.includes(' ') ? "text-green-500" : ""}`}>
                <span className="mr-2">✔</span> Pas d'espaces
              </li>
              <li className={`flex items-center ${formData.name === formData.name.toLowerCase() ? "text-green-500" : ""}`}>
                <span className="mr-2">✔</span> En minuscules
              </li>
            </ul>
          </div>
        )}

        {step >= 2 && (
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@email.com"
              className="form-input w-full py-2"
              value={formData.email}
              required
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            {localErrors.email && (
              <p className="text-red-500 text-sm mt-1">{localErrors.email}</p>
            )}
          </div>
        )}

        {step >= 3 && (
          <div>
            <label htmlFor="confirmEmail" className="mb-1 block text-sm font-medium text-gray-700">
              Confirmer l'email
            </label>
            <input
              id="confirmEmail"
              type="email"
              placeholder="Confirmez votre email"
              className="form-input w-full py-2"
              value={formData.confirmEmail}
              required
              onChange={(e) => handleInputChange("confirmEmail", e.target.value)}
            />
            {localErrors.confirmEmail && (
              <p className="text-red-500 text-sm mt-1">{localErrors.confirmEmail}</p>
            )}
          </div>
        )}

        {step >= 4 && (
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="form-input w-full py-2"
              value={formData.password}
              required
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
            {localErrors.password && (
              <p className="text-red-500 text-sm mt-1">{localErrors.password}</p>
            )}
            <ul className="mt-2 text-sm text-gray-700">
              <li className={`flex items-center ${passwordCriteria.length ? "text-green-500" : ""}`}>
                <span className="mr-2">✔</span> Au moins 12 caractères
              </li>
              <li className={`flex items-center ${passwordCriteria.specialChar ? "text-green-500" : ""}`}>
                <span className="mr-2">✔</span> Au moins un caractère spécial
              </li>
              <li className={`flex items-center ${passwordCriteria.uppercase ? "text-green-500" : ""}`}>
                <span className="mr-2">✔</span> Au moins une majuscule
              </li>
              <li className={`flex items-center ${passwordCriteria.number ? "text-green-500" : ""}`}>
                <span className="mr-2">✔</span> Au moins un chiffre
              </li>
            </ul>
          </div>
        )}

        {step >= 5 && (
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirmez votre mot de passe"
              className="form-input w-full py-2"
              value={formData.confirmPassword}
              required
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            />
            {localErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{localErrors.confirmPassword}</p>
            )}
          </div>
        )}

        {step >= 5 && (
          <>
            <div className="flex items-center justify-between mt-4">
              <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                J'accepte les <a href="/terms" className="text-blue-500 hover:underline">conditions d'utilisation</a>
              </label>
              <div
                id="acceptTerms"
                className={`relative w-12 h-6 ${acceptTerms ? "bg-green-500" : "bg-gray-300"} rounded-full cursor-pointer`}
                onClick={() => setAcceptTerms(prev => !prev)}
              >
                <div
                  className={`absolute w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${acceptTerms ? "translate-x-6" : ""}`}
                ></div>
              </div>
            </div>
            {localErrors.terms && (
              <p className="text-red-500 text-sm mt-1">{localErrors.terms}</p>
            )}

            <div className="flex items-center justify-between mt-4">
              <label htmlFor="acceptNewsletter" className="text-sm text-gray-700">
                S'inscrire à la newsletter
              </label>
              <div
                id="acceptNewsletter"
                className={`relative w-12 h-6 ${acceptNewsletter ? "bg-green-500" : "bg-gray-300"} rounded-full cursor-pointer`}
                onClick={() => setAcceptNewsletter(prev => !prev)}
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
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {step >= 5 && (
        <button
          type="submit"
          className="btn w-full bg-black text-white mt-4 disabled:bg-gray-400"
          disabled={loading || !acceptTerms || Object.keys(localErrors).length > 0}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Inscription...
            </span>
          ) : (
            "S'inscrire"
          )}
        </button>
      )}
    </form>
  );
}