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
  
  // Pas d'utilisateur connecté - laisser le middleware gérer la redirection vers auth
  console.log('ℹ️ [DASHBOARD-HOME] Pas d\'utilisateur connecté, le middleware va rediriger');
  
  // Cette page ne devrait jamais s'afficher car le middleware va rediriger
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}