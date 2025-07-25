"use client"
import { useState } from "react";
import { Button } from "@/src/components/landing-page/Button";


export default function SMPForgotPasswordForm() {
  const [email, setEmail] = useState(""); // État pour l'email
  const [status, setStatus] = useState<string | null>(null); // État pour le message de statut
  const [loading, setLoading] = useState(false); // État pour le chargement

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Indiquer que la mutation est en cours
    setStatus(null); // Réinitialiser le message

    try {
      const response = await fetch("/api/auth/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // On ne révèle jamais si l'email existe ou non
      setStatus(
        "If this email address is recognized, a password reset email will be sent shortly."
      );
    } catch (error) {
      console.error("Forgot Password Error:", error);
      setStatus(
        "If this email address is recognized, a password reset email will be sent shortly."
      ); // Toujours un message générique
    } finally {
      setLoading(false); // Arrêter le chargement
    }
  };

  return (
    <>
      {status ? (
        // Message affiché après soumission
        <div className="mt-6 text-center text-gray-700">
          <p>{status}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                className="form-input w-full py-2"
                type="email"
                placeholder="corybarker@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Mise à jour de l'état de l'email
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <Button
              type="submit"
              disabled={loading} // Désactiver le bouton pendant le chargement
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
