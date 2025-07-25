export const metadata = {
  title: "Forgot Password - Simple",
  description: "Page description",
};

import SMPForgotPasswordForm from "@/src/components/password/forgotPasswordForm"; // Chemin vers le composant

export default function ForgotPassword() {
  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Forgot password</h1>
      </div>

      {/* Inclusion du composant ForgotPasswordForm */}
      <SMPForgotPasswordForm />
    </>
  );
}
