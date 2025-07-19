import { CallToAction } from '@/src/components/landing-page/CallToAction'
import { Faqs } from '@/src/components/landing-page/Faqs'
import { Footer } from '@/src/components/landing-page/Footer'
import { Header } from '@/src/components/landing-page/Header'
import { Hero } from '@/src/components/landing-page/Hero'
// import { Pricing } from '@/src/components/landing-page/Pricing'
import { PrimaryFeatures } from '@/src/components/landing-page/PrimaryFeatures'
import { SecondaryFeatures } from '@/src/components/landing-page/SecondaryFeatures'
import { Testimonials } from '@/src/components/landing-page/Testimonials'
import  SMPServiceCarousel  from '@/src/components/landing-page/CardCaroussel'

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
  
  // Si l'utilisateur est connecté, rediriger vers le dashboard
  if (existingUser) {
    redirect("/account");
  }
  
  // Sinon, rediriger vers la page de connexion
  redirect("/signin");
}
