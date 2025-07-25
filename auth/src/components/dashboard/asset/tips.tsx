"use client";

import React, { useState, useEffect } from 'react';

// Conseils pour service
const serviceTips: { [key: number]: string[] } = {
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

// Conseils pour asset (à étendre si nécessaire)
const assetTips: { [key: number]: string[] } = {
  0: [
    "Donnez un titre concis pour facilement identifier votre asset.",
    "Le titre doit être clair et descriptif.",
  ],
  1: [
    "Choisissez un prix adapté et pensez aux éventuels frais de TVA.",
  ],
  2: [
    "Ajoutez jusqu'à 3 images de qualité pour mettre en valeur votre asset.",
  ],
  3: [
    "Définissez si vous limitez le stock et précisez la quantité en stock.",
  ],
  4: [
    "Vérifiez toutes les informations avant de finaliser la création.",
  ],
};

type TipsProps = {
  step: number;
  context: 'service' | 'asset';
};

const Tips: React.FC<TipsProps> = ({ step, context }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const tipsMap = context === 'service' ? serviceTips : assetTips;
  const tipsList = tipsMap[step];

  // Détection du mode mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Rotation des conseils toutes les 4 secondes
  useEffect(() => {
    if (!tipsList || tipsList.length === 0) return;
    setCurrentTip(0); // reset quand on change de slide
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tipsList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [step, context, tipsList]);

  if (isMobile || !tipsList || tipsList.length === 0) return null;

  return (
    <div className="p-2 max-w-md text-center">
      <h3 className="text-sm font-semibold mb-1 text-gray-800">Petits Tips</h3>
      <p className="text-gray-600 text-xs whitespace-nowrap truncate">
        {tipsList[currentTip]}
      </p>
    </div>
  );
};

export default Tips;
