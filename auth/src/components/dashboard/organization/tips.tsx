"use client";

import React, { useEffect, useState } from "react";

// Ajoutez vos textes pour chaque step
const orgTips: { [key: number]: string[] } = {
  0: [
    "Choisissez un nom de marque percutant.",
    "Cochez la case si l'organisation est déjà enregistrée légalement.",
    "Vous pourrez renseigner ses informations juridiques plus tard ",
  ],
  1: [
    "Sélectionnez le secteur d'activité principal.",
    "Cela vous aidera à être correctement référencé dans la plateforme.",
  ],
  2: [
    "Indiquez si vous avez une adresse physique.",
    "Vous pouvez toujours la renseigner plus tard si vous hésitez.",
  ],
  3: [
    "Fournissez les informations légales (SIRET, TVA, etc.).",
    "Assurez-vous que tout est correct pour des raisons administratives.",
  ],
};

type TipsProps = {
  step: number;
};

const Tips: React.FC<TipsProps> = ({ step }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const tipsForStep = orgTips[step];

  useEffect(() => {
    // Remettre à 0 quand on change de step
    setCurrentTip(0);
  }, [step]);

  useEffect(() => {
    // Faire défiler les tips
    const interval = setInterval(() => {
      setCurrentTip((prev) =>
        tipsForStep && tipsForStep.length > 0 ? (prev + 1) % tipsForStep.length : 0
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [tipsForStep]);

  if (!tipsForStep) return null;

  return (
    <div className="p-4 max-w-lg text-center">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">Conseils</h3>
      <p className="text-gray-600 text-base">{tipsForStep[currentTip]}</p>
    </div>
  );
};

export default Tips;
