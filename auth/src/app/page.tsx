import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata = {
  title: "Services — Authentification",
  description: "Connectez-vous à votre compte Services",
};

export default async function HomePage() {
  const cookieStore = cookies();
  const existingUser = cookieStore.get("smp_user_0");
  
  // Si l'utilisateur est déjà connecté, rediriger vers le DASHBOARD
  if (existingUser) {
    try {
      const user = JSON.parse(decodeURIComponent(existingUser.value));
      if (user?.userID && !user.userID.startsWith('temp-')) {
        console.log('✅ [AUTH-HOME] Utilisateur connecté, redirection vers Dashboard');
        // Redirection vers le dashboard (port 3002)
        redirect("http://localhost:3002/account");
      }
    } catch (error) {
      console.log('⚠️ [AUTH-HOME] Erreur parsing cookie:', error);
      // En cas d'erreur, rediriger vers signin
    }
  }
  
  // Pas d'utilisateur connecté ou erreur, rediriger vers signin
  console.log('ℹ️ [AUTH-HOME] Pas d\'utilisateur connecté, redirection vers signin');
  redirect("/signin");
}