import ResetPasswordForm from "@/src/components/password/resetPasswordForm";

export const dynamic = "force-dynamic"; // Force le mode dynamique

export default function ResetPasswordPage() {



  return (
    <>
    <div className="mb-10">
    <h1 className="text-4xl font-bold">Reset password</h1>
  </div>

        <ResetPasswordForm />
        </>
  );
}