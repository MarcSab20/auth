"use client"; // Indique que ce composant est un Client Component

import { useState } from "react";
import { Button } from "@/src/components/landing-page/Button";


// Données de navigation pour les liens sociaux
const navigation = {
  social: [
    {
      name: "X",
      href: "https://x.com/smp_ceo",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
        </svg>
      ),
    },
    {
      name: "GitHub",
      href: "https://github.com/smp_ceo", // Correction du lien GitHub
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      ),
    },
  ],
};

// Props pour le composant Footer
interface FooterProps {
  newletter?: boolean; // Option pour afficher ou non la section newsletter
}

export default function SMPFooter({ newletter = true }: FooterProps) {
  const [email, setEmail] = useState(""); // État pour l'email
  const [isValidEmail, setIsValidEmail] = useState(false); // État pour valider l'email

  // Gestionnaire de changement pour l'input email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsValidEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)); 
  };

  return (
    <footer className="w-full  px-4 sm:px-6   bottom-0 left-0 right-0 mt-5">
      {/* Conteneur principal */}
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-8 sm:pt-10 lg:px-8">
        {/* Section Newsletter */}
        {newletter && (
          <div className="mt-6 border-t border-gray-200 pt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">S'inscrire à la newsletter</h3>
              <p className="mt-2 text-sm text-gray-600">
                Soyez informés des nouveautés !
              </p>
            </div>
            <form className="mt-4 sm:flex sm:max-w-md lg:mt-0">
              <input
                type="email"
                required
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email to subscribe"
                className={`w-full min-w-0 appearance-none rounded-md px-3 py-1 text-base text-gray-900 placeholder-gray-400 ring-1 ring-inset focus:outline-none focus:ring-2 sm:w-56 sm:text-sm ${
                  isValidEmail ? "ring-green-500" : "ring-gray-300"
                }`}
              />
              <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                <Button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-md bg-black px-3 py-1 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Subscribe
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Bas de footer */}
        <div className="mt-6 border-t border-gray-200 pt-4 flex flex-col items-center space-y-4 md:flex-row md:justify-between">
          <p className="text-xs text-gray-500">
            &copy; 2024 Services SAS. All rights reserved.
          </p>
          <div className="flex space-x-4">
            {navigation.social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">{item.name}</span>
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}