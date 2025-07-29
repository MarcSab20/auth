// dashboard/src/app/page.tsx - CORRECTION
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata = {
  title: "Services — Dashboard",
  description: "Tableau de bord Services",
};

export default async function HomePage() {
  const cookieStore = cookies();
  const existingUser = cookieStore.get("smp_user_0");
  
  // Si l'utilisateur est déjà connecté, rediriger vers /account
  if (existingUser) {
    try {
      const user = JSON.parse(decodeURIComponent(existingUser.value));
      if (user?.userID && !user.userID.startsWith('temp-')) {
        console.log('✅ [DASHBOARD-HOME] Utilisateur connecté, redirection vers /account');
        redirect("/account");
      }
    } catch (error) {
      console.log('⚠️ [DASHBOARD-HOME] Erreur parsing cookie:', error);
      // En cas d'erreur, laisser le middleware gérer la redirection
    }
  }
  
  // CORRECTION: Ne pas afficher de contenu ici, laisser le middleware gérer la redirection
  // Cette page ne devrait jamais s'afficher car le middleware va rediriger vers auth
  console.log('ℹ️ [DASHBOARD-HOME] Pas d\'utilisateur connecté, le middleware va rediriger vers auth');
  
  // Afficher un écran de chargement pendant que le middleware traite la redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 mb-2">Vérification de l'authentification...</p>
        <p className="text-sm text-gray-500">
          Si vous n'êtes pas redirigé automatiquement, 
          <a 
            href={`${process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'}/signin`}
            className="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            cliquez ici pour vous connecter
          </a>
        </p>
      </div>
    </div>
  );
}