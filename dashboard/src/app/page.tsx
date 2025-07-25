import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata = {
  title: "Services — Authentification",
  description: "Connectez-vous à votre compte Services",
};

export default async function HomePage() {
  // Vérifier si l'utilisateur est déjà connecté
  const cookieStore = cookies();
  const existingUser = cookieStore.get("smp_user_0");
  
  if (existingUser) {
    redirect("/account");
  }
  
}
