import React, { useState } from "react";
import AccordionItem from "@/src/components/accordionItem";
import { Button } from "@/src/components/landing-page/Button";


const ApplicationSettings: React.FC = () => {
  // Déclarations des variables de sélection
  const [selectedLanguage, setSelectedLanguage] = useState<string>("fr");
  const [selectedTheme, setSelectedTheme] = useState<string>("clair");
  const [selectedTimezone, setSelectedTimezone] = useState<string>("Europe/Paris");

  // Listes des options
  const languages = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
  ];

  const themes = [
    { name: "clair", color: "bg-gray-200" },
    { name: "sombre", color: "bg-gray-800" },
    { name: "bleu", color: "bg-blue-500" },
  ];

  const timezones = [
    { zone: "Europe/Paris", label: "Paris (GMT+1)" },
    { zone: "America/New_York", label: "New York (GMT-5)" },
    { zone: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Carte principale avec hauteur fixe pour forcer le scroll interne */}
      <div className="bg-white rounded-lg p-8 w-full h-[800px] flex flex-col">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Paramètres de l'Application
          </h1>
          <p className="text-gray-600 mb-6">
            Configurez les paramètres de votre application.
          </p>
        </div>

        {/* Zone scrollable contenant les sections */}
        <div className="flex-1 overflow-y-auto">
          {/* Section Général avec accordéons imbriqués */}
          <AccordionItem title="Général">
            <div className="space-y-4">
              {/* Sélection de la langue */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Langue
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-md"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélection du thème */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Thème
                </label>
                <div className="flex space-x-4 mt-2">
                  {themes.map((theme) => (
                    <Button
                      key={theme.name}
                      onClick={() => setSelectedTheme(theme.name)}
                      className={`w-8 h-8 rounded-full ${theme.color} ${
                        selectedTheme === theme.name ? "ring-2 ring-blue-500" : ""
                      }`}
                      aria-label={theme.name}
                    />
                  ))}
                </div>
              </div>

              {/* Sélection du fuseau horaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fuseau horaire
                </label>
                <select
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  className="mt-1 w-full border border-gray-300 p-2 rounded-md"
                >
                  {timezones.map((tz) => (
                    <option key={tz.zone} value={tz.zone}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </AccordionItem>

          {/* Section Contacts */}
          <AccordionItem title="Contacts">
            <div className="space-y-4">
              <p>Email de support : support@serviceselel.com</p>
              <p>Téléphone : +33 1 23 45 67 89</p>
              <p>Adresse : 123 Rue de la Liberté, 75000 Paris, France</p>
            </div>
          </AccordionItem>

          {/* Section FAQ */}
          <AccordionItem title="FAQ">
            <AccordionItem title="Comment retirer l'argent de mon wallet Services ?">
              <p>
                Accédez à votre wallet, sélectionnez "Retirer" et suivez les
                instructions pour transférer les fonds sur votre compte bancaire.
              </p>
            </AccordionItem>
            <AccordionItem title="Comment régler un litige ? Suis-je assuré ?">
              <p>
                Contactez notre support client. Les litiges sont traités selon
                nos conditions générales et notre système de garantie.
              </p>
            </AccordionItem>
            <AccordionItem title="Comment créer une organisation ?">
              <p>
                Accédez à votre espace administrateur, cliquez sur "Créer une
                Organisation" et remplissez le formulaire.
              </p>
            </AccordionItem>
            <AccordionItem title="Comment créer un service ?">
              <p>
                Sélectionnez "Créer un Service" dans le tableau de bord, ajoutez
                les détails et publiez votre offre.
              </p>
            </AccordionItem>
            <AccordionItem title="Qu'est-ce qu'une option de service ?">
              <p>
                Une option de service est un complément facultatif qui permet
                d’ajouter des fonctionnalités supplémentaires à votre offre.
              </p>
            </AccordionItem>
          </AccordionItem>

          {/* Section À propos de votre compte */}
          <AccordionItem title="À propos de votre compte">
            <p>Date de création du compte : 01/01/2022</p>
            <AccordionItem title="Politique de confidentialité">
              <p>
                Nous protégeons vos données et respectons la confidentialité de
                vos informations personnelles.
              </p>
            </AccordionItem>
            <AccordionItem title="Conditions d'utilisation">
              <p>
                Nos conditions définissent vos droits et obligations lors de
                l’utilisation de Services Elel SAS.
              </p>
            </AccordionItem>
          </AccordionItem>
        </div>

        {/* Pied de page fixe (version) */}
        <div className="pt-2 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">Services Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSettings;
