import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import SignInForm from "@/src/components/signin/singinForm";

export const metadata = {
  title: "Connexion à Services",
  description: "Accédez à votre compte Services pour gérer vos services et organisations.",
  openGraph: {
    title: "Connexion - Services",
    description: "Connectez-vous pour retrouver vos services et vos équipes sur Services.",
    url: "https://dev-app.sh1.hidora.net/signin",
    siteName: "Services",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Connexion - Services",
    description: "Rejoignez votre équipe sur Services dès maintenant.",
  },
};

export default async function SignInPage() {
  const cookieStore = cookies();
  const existingUser = cookieStore.get("smp_user_0");
  
  if (existingUser) {
    redirect("/account");
  }

  return (
    <div className="container mx-auto px-4">
      <SignInForm />
    </div>
  );
}