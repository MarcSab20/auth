// src/components/invitation/organization/organizationSignupForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useSignupInvitation } from "@/context/signupInvitationContext";
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

interface SMPSignUpFormProps {
  email: string;
  organizationID: string;
  organizationName?: string;
  firstName?: string;
  lastName?: string;
  isReadOnly?: boolean;
  showOrganizationInfo?: boolean;
}

export default function SMPSignUpForm({ 
  email, 
  organizationID, 
  organizationName,
  firstName: initialFirstName,
  lastName: initialLastName,
  isReadOnly = false,
  showOrganizationInfo = true
}: SMPSignUpFormProps) {
  const { signupInvitation, error, success, loading } = useSignupInvitation();
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    firstName: initialFirstName || "",
    lastName: initialLastName || "",
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

  useEffect(() => {
    if (initialFirstName && initialFirstName.trim() && initialLastName && initialLastName.trim()) {
      setStep(4);
    }
  }, [initialFirstName, initialLastName]);

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
      if (field === "firstName" || field === "lastName") {
        if (formData.firstName.trim() && formData.lastName.trim()) {
          setStep(prev => Math.max(prev, 2));
        }
      } else if (field === "name") {
        setStep(prev => Math.max(prev, 3));
      } else if (field === "password") {
        setStep(prev => Math.max(prev, 4));
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

    if (!formData.firstName.trim()) {
      errors.firstName = "Le prénom est requis.";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Le nom est requis.";
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
    if (!validateFields()) return;

    const signupData = {
      name: formData.name,
      email: email,
      confirmEmail: email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      firstName: formData.firstName,
      lastName: formData.lastName
    };

    try {
      await signupInvitation(signupData, acceptNewsletter, organizationID);
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

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold">
          {formData.firstName ? `Bonjour ${formData.firstName},` : 'Bonjour,'}
        </h1>
        {showOrganizationInfo && (
          <h2 className="text-2xl font-semibold text-gray-700 mt-2">
            Une dernière étape avant de rejoindre {organizationName || 'votre organisation'}
          </h2>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {step >= 1 && (
            <>
              <div>
                <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className={`form-input w-full py-2 ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  value={formData.firstName}
                  required
                  readOnly={isReadOnly}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
                {localErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{localErrors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className={`form-input w-full py-2 ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  value={formData.lastName}
                  required
                  readOnly={isReadOnly}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
                {localErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{localErrors.lastName}</p>
                )}
              </div>
            </>
          )}

          {step >= 2 && (
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

          {step >= 3 && (
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input w-full py-2 bg-gray-100 cursor-not-allowed"
                value={email}
                readOnly
              />
              <p className="mt-1 text-sm text-gray-500">
                L'email ne peut pas être modifié car il est lié à votre invitation.
              </p>
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

          {step >= 4 && (
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
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

          {step >= 4 && (
            <>
              <div className="flex items-center justify-between mt-6">
                <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                  J'accepte les <a href="/terms" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">conditions d'utilisation</a>
                </label>
                <div
                  id="acceptTerms"
                  className={`relative w-12 h-6 ${acceptTerms ? "bg-green-500" : "bg-gray-300"} rounded-full cursor-pointer transition-colors`}
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
                  S'inscrire à la newsletter (optionnel)
                </label>
                <div
                  id="acceptNewsletter"
                  className={`relative w-12 h-6 ${acceptNewsletter ? "bg-green-500" : "bg-gray-300"} rounded-full cursor-pointer transition-colors`}
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

        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 font-medium">Erreur</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 font-medium">Succès !</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Inscription réussie ! Vous allez être redirigé vers la page de connexion...
            </p>
          </div>
        )}

        {/* Bouton de soumission */}
        {step >= 4 && (
          <button
            type="submit"
            className={`btn w-full mt-6 py-3 px-4 rounded-lg font-medium transition-all ${
              loading || !acceptTerms || Object.keys(localErrors).length > 0
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
            }`}
            disabled={loading || !acceptTerms || Object.keys(localErrors).length > 0}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </span>
            ) : (
              `Rejoindre ${organizationName || "l'organisation"}`
            )}
          </button>
        )}

        {/* Aide et conditions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            En vous inscrivant, vous acceptez de rejoindre cette organisation et de respecter ses règles internes.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Besoin d'aide ? <a href="mailto:support@example.com" className="text-blue-500 hover:underline">Contactez le support</a>
          </p>
        </div>
      </form>
    </div>
  );
}