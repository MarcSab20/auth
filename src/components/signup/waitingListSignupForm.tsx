"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWaitingListSignup } from "@/context/waitingListSignupContext";
import { SignupInvitationFormData } from "@/types/waitingListSignup";

function NoTokenMessage() {
  return (
    <div className="text-center py-12">
      <div className="mb-4">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Accès non autorisé
      </h3>
      <p className="text-gray-500 mb-4">
        Une autorisation valide est requise pour s'inscrire sur la plateforme.
      </p>
      <p className="text-sm text-gray-500">
        Si vous avez reçu un email d'invitation, veuillez utiliser le lien fourni pour accéder au formulaire d'inscription.
      </p>
    </div>
  );
}

export default function WaitingListSignupForm() {
  const searchParams = useSearchParams();
  const { signupWaitingList, error, loading, success } = useWaitingListSignup();
  const [tokenData, setTokenData] = useState<any>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SignupInvitationFormData>({
    name: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [acceptNewsletter, setAcceptNewsletter] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyToken(token);
    }
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch("/api/waiting-list/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.response?.errors?.[0]?.message;
        if (errorMessage?.includes("déjà été traitée")) {
          window.location.href = "/signin?message=Ce lien d'inscription a déjà été utilisé. Veuillez vous connecter avec vos identifiants.";
          return;
        }
        throw new Error(errorMessage || "Erreur lors de la vérification du token");
      }

      if (data.isUserExists) {
        window.location.href = "/signin?message=Un compte existe déjà avec cet email. Veuillez vous connecter.";
        return;
      }

      setTokenData(data);
      setFormData(prev => ({
        ...prev,
        firstName: data.firstName || "",
        lastName: data.lastName,
        email: data.email,
        confirmEmail: data.email,
      }));
    } catch (err) {
      console.error("Token verification error:", err);
      setTokenError(err instanceof Error ? err.message : "Une erreur est survenue lors de la vérification du token.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenData) return;
    if (!acceptTerms) {
      setTokenError("Vous devez accepter les conditions d'utilisation.");
      return;
    }
    await signupWaitingList(formData, acceptNewsletter, tokenData.waitingListID);
  };

  if (!searchParams.get("token") || tokenError) {
    return <NoTokenMessage />;
  }

  if (!tokenData) {
    return <div>Vérification du token en cours...</div>;
  }

  return (
    <div>
      {/* Titre Principal */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold">
          {tokenData?.firstName ? `Bonjour ${tokenData.firstName},` : 'Bonjour,'}
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-2">
          Une dernière étape avant de rejoindre la plateforme
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Informations personnelles */}
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
              Prénom
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="John"
              className="form-input w-full py-2"
              value={formData.firstName}
              required
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Doe"
              className="form-input w-full py-2"
              value={formData.lastName}
              required
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

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
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase() })}
            />
            <ul className="mt-2 text-sm text-gray-700">
              <li className="flex items-center">
                <span className="mr-2">✔</span> Au moins 4 caractères
              </li>
              <li className="flex items-center">
                <span className="mr-2">✔</span> Pas d'espaces
              </li>
              <li className="flex items-center">
                <span className="mr-2">✔</span> En minuscules
              </li>
            </ul>
          </div>

          {/* Email (lecture seule) */}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input w-full py-2 bg-gray-100 cursor-not-allowed"
              value={formData.email}
              readOnly
            />
            <p className="mt-2 text-sm text-gray-500">
              L'email ne peut pas être modifié car il est lié à votre invitation.
            </p>
          </div>

          {/* Mot de passe */}
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
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <ul className="mt-2 text-sm text-gray-700">
              <li className="flex items-center">
                <span className="mr-2">✔</span> Au moins 12 caractères
              </li>
              <li className="flex items-center">
                <span className="mr-2">✔</span> Au moins un caractère spécial
              </li>
              <li className="flex items-center">
                <span className="mr-2">✔</span> Au moins une majuscule
              </li>
              <li className="flex items-center">
                <span className="mr-2">✔</span> Au moins un chiffre
              </li>
            </ul>
          </div>

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
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          {/* Conditions et newsletter */}
          <div className="flex items-center justify-between mt-4">
            <label htmlFor="acceptTerms" className="text-sm text-gray-700">
              J'accepte les <a href="/terms" className="text-blue-500 hover:underline">conditions d'utilisation</a>
            </label>
            <div
              id="acceptTerms"
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
              id="acceptNewsletter"
              className={`relative w-12 h-6 ${acceptNewsletter ? "bg-green-500" : "bg-gray-300"} rounded-full cursor-pointer`}
              onClick={() => setAcceptNewsletter(!acceptNewsletter)}
            >
              <div
                className={`absolute w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${acceptNewsletter ? "translate-x-6" : ""}`}
              ></div>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}

        <button
          type="submit"
          className="btn w-full bg-black text-white mt-4"
          disabled={loading}
        >
          {loading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>
    </div>
  );
} 