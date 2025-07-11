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


export const metadata = {
  title: "Services — Plateforme de services nouvelle génération", // [SEO]
  description: "Découvrez une plateforme moderne pour connecter les prestataires et les clients avec fluidité.", // [SEO]

  openGraph: {
    title: "Services - Marketplace des services", // [SEO]
    description: "Réinventez la manière de proposer et trouver des services.", // [SEO]
    url: "https://dev-app.sh1.hidora.net", // [LINK]
    siteName: "Services",
    images: [
      {
        url: "https://dev-app.sh1.hidora.net/images/landing-hero.jpg", // [IMG]
        width: 1200,
        height: 630,
        alt: "Services - plateforme de services",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Services — Vos services, autrement", // [SEO]
    description: "Une nouvelle ère de services. Simple, rapide, efficace.", // [SEO]
    images: ["https://dev-app.sh1.hidora.net/images/landing-hero.jpg"], // [IMG]
  },
};

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        {/* <PrimaryFeatures /> */}
        <SMPServiceCarousel />
        <SecondaryFeatures />
        <CallToAction />
        {/* <Testimonials /> */}
        {/* <Pricing /> */}
        <Faqs />
      </main>
      <Footer />
    </>
  )
}
