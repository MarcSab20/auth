// auth/src/app/page.tsx - CORRECTION DE LA REDIRECTION AVEC COMPOSANT CLIENT
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ExternalRedirect from "@/src/components/auth/ExternalRedirect";

export const metadata = {
  title: "Services — Authentification",
  description: "Connectez-vous à votre compte Services",
};

export default async function HomePage() {
  const cookieStore = cookies();
  const existingUser = cookieStore.get("smp_user_0");
  
  // Si l'utilisateur est déjà connecté, utiliser le composant de redirection externe
  if (existingUser) {
    try {
      const user = JSON.parse(decodeURIComponent(existingUser.value));
      if (user?.userID && !user.userID.startsWith('temp-')) {
        console.log('✅ [AUTH-HOME] Utilisateur connecté, préparation redirection vers Dashboard');
        
        const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002';
        
        return (
          <ExternalRedirect 
            targetUrl={dashboardUrl}
            fallbackUrl="/signin"
            message="Redirection vers le dashboard..."
          />
        );
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