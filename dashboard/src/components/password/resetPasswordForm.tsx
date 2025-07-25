"use client"

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/src/components/landing-page/Button";


// Interface pour les critères de mot de passe
interface PasswordCriteria {
  length: boolean;
  specialChar: boolean;
  uppercase: boolean;
  number: boolean;
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordCriteria, setPasswordCriteria] = useState<PasswordCriteria>({
    length: false,
    specialChar: false,
    uppercase: false,
    number: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Récupérer le token depuis l'URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setErrorMessage("Token is missing in the URL.");
      router.push("/error"); // Redirige vers une page d'erreur si le token est manquant
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams, router]);

  // Validation du mot de passe
  const validatePassword = (value: string) => {
    setPasswordCriteria({
      length: value.length >= 12,
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      uppercase: /[A-Z]/.test(value),
      number: /[0-9]/.test(value),
    });
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    // Vérification des critères de mot de passe
    if (!passwordCriteria.length) {
      setErrorMessage("Password must be at least 12 characters long.");
      setIsLoading(false);
      return;
    }
    if (!passwordCriteria.specialChar) {
      setErrorMessage("Password must include at least one special character.");
      setIsLoading(false);
      return;
    }
    if (!passwordCriteria.uppercase) {
      setErrorMessage("Password must include at least one uppercase letter.");
      setIsLoading(false);
      return;
    }
    if (!passwordCriteria.number) {
      setErrorMessage("Password must include at least one number.");
      setIsLoading(false);
      return;
    }

    // Vérification que les mots de passe correspondent
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    // Vérification du token
    if (!token) {
      setErrorMessage("Token is missing.");
      setIsLoading(false);
      return;
    }

    try {
      // Appel de l'API interne Next.js
      const response = await fetch("/api/auth/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage("Password reset successfully!");
        setTimeout(() => router.push("/signin"), 2000);
      } else {
        setErrorMessage(data.message || "Failed to reset password.");
      }
    } catch (error) {
      setErrorMessage("Failed to reset password. Please try again.");
      console.error("Error resetting password:", error);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label
          className="mb-1 block text-sm font-medium text-gray-700"
          htmlFor="password"
        >
          New Password
        </label>
        <input
          id="password"
          className="form-input w-full py-2"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          required
          onChange={(e) => {
            setPassword(e.target.value);
            validatePassword(e.target.value);
          }}
        />
        <ul className="mt-2 text-sm text-gray-700">
          <li
            className={`flex items-center ${
              passwordCriteria.length ? "text-green-500" : ""
            }`}
          >
            <span className="mr-2">✔</span> At least 12 characters
          </li>
          <li
            className={`flex items-center ${
              passwordCriteria.specialChar ? "text-green-500" : ""
            }`}
          >
            <span className="mr-2">✔</span> At least one special character
          </li>
          <li
            className={`flex items-center ${
              passwordCriteria.uppercase ? "text-green-500" : ""
            }`}
          >
            <span className="mr-2">✔</span> At least one uppercase letter
          </li>
          <li
            className={`flex items-center ${
              passwordCriteria.number ? "text-green-500" : ""
            }`}
          >
            <span className="mr-2">✔</span> At least one number
          </li>
        </ul>
      </div>

      <div className="mt-4">
        <label
          className="mb-1 block text-sm font-medium text-gray-700"
          htmlFor="confirmPassword"
        >
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          className="form-input w-full py-2"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          required
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {/* Messages d'erreur ou de succès */}
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}

      {/* Bouton de soumission */}
      <Button
        type="submit"
        disabled={
          isLoading ||
          !token ||
          !passwordCriteria.length ||
          !passwordCriteria.specialChar ||
          !passwordCriteria.uppercase ||
          !passwordCriteria.number ||
          password !== confirmPassword
        }
      >
        {isLoading ? "..." : "Reset Password"}
      </Button>
    </form>
  );
}
