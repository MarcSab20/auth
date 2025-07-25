import SignUpForm from "@/src/components/signup/signupForm";

export const metadata = {
  title: "Créer un compte - Services", // [SEO]
  description: "Inscrivez-vous gratuitement sur Services et commencez à proposer ou réserver des services en toute simplicité.", // [SEO]

  openGraph: {
    title: "Rejoignez Services", // [SEO]
    description: "L'inscription est gratuite et rapide. Découvrez une nouvelle manière de connecter clients et prestataires.", // [SEO]
    url: "https://dev-app.sh1.hidora.net/signup", // [LINK]
    siteName: "Services",
    images: [
      {
        url: "https://dev-app.sh1.hidora.net/images/signup-preview.jpg", // [IMG]
        width: 1200,
        height: 630,
        alt: "Création de compte  Services",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Inscription gratuite - Services", // [SEO]
    description: "Rejoignez la plateforme des services nouvelle génération dès aujourd’hui.", // [SEO]
    images: ["https://dev-app.sh1.hidora.net/images/signup-preview.jpg"], // [IMG]
  },
};

export default function SignUpPage() {
  return (
      <div>
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Créez votre compte</h1>
        </div>
        <SignUpForm />
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            En vous inscrivant vous acceptez les{" "}
            <a
              className="whitespace-nowrap font-medium text-gray-700 underline hover:no-underline"
              href="#0"
            >
              Termes de Services
            </a>{" "}
            et{" "}
            <a
              className="whitespace-nowrap font-medium text-gray-700 underline hover:no-underline"
              href="#0"
            >
              Politique de confidentialité
            </a>
            .
          </p>
        </div>
      </div>
  );
}