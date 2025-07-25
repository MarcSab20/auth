"use client";

import React, { useEffect, useState } from 'react';

const tips: { [key: number]: string[] } = {
  0: [
    "Choisissez une organisation à laquelle ce service appartient.",
    "Cela facilite la gestion et la classification de vos services.",
    "Vous pouvez créer une nouvelle organisation si nécessaire.",
  ],
  1: [
    "Lorsque vous pensez à votre service, qu'est-ce que cela vous inspire ?",
    "Allez droit au but pour rendre votre titre clair et impactant.",
    "La modification du titre du service est limitée, prenez votre temps.",
  ],
  2: [
    "Décrivez votre service de manière détaillée.",
    "Qu'est-ce qui rend votre service unique ?",
    "Utilisez des mots clés pour attirer vos clients.",
  ],
  3: [
    "Choisissez un prix compétitif.",
    "Assurez-vous que le prix reflète la valeur de votre service.",
    "Pensez à vos coûts et à votre rentabilité.",
  ],
  4: [
    "Fixez une fourchette de prix réaliste.",
    "Il est conseillé de ne pas dépasser 20% de variation.",
    "Soyez transparent avec vos clients.",
  ],
  5: [
    "Ajoutez une adresse physique si votre service nécessite un lieu spécifique.",
    "Les clients doivent pouvoir vous trouver facilement.",
    "Vous pouvez ajouter une adresse virtuelle si votre service est en ligne.",
  ],
  8: [
    "Félicitations ! Vous êtes sur le point de finaliser la création.",
    "Revoyez vos informations avant de terminer.",
    "Vous pourrez toujours modifier votre service plus tard.",
  ],
};

type TipsProps = {
  step: number;
};

const Tips: React.FC<TipsProps> = ({ step }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Détection du mode mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Si en mode mobile, ne pas afficher les tips
  if (isMobile) return null;

  // Rotation des tips toutes les 4 secondes si desktop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) =>
        tips[step] && tips[step].length > 0 ? (prev + 1) % tips[step].length : 0
      );
    }, 4000); // Rotation toutes les 4 secondes

    return () => clearInterval(interval);
  }, [step]);

  if (!tips[step]) return null;

  return (
    <div className="p-2 max-w-md text-center">
      <h3 className="text-sm font-semibold mb-1 text-gray-800">Petits Tips</h3>
      <p className="text-gray-600 text-xs whitespace-nowrap truncate">
        {tips[step][currentTip]}
      </p>
    </div>
  );
};

export default Tips;
