"use client";

import React, { useState, useEffect } from "react";
import { useServiceContext } from "@/context/create/createServiceContext";

// Supprime l'apparence native des inputs number
const inputStyle = "appearance-none";

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

function interpolateColor(factor: number) {
  const green = { r: 132, g: 204, b: 22 }; // #84cc16
  const red = { r: 239, g: 68, b: 68 };     // #ef4444
  const r = Math.round(green.r + (red.r - green.r) * factor);
  const g = Math.round(green.g + (red.g - green.g) * factor);
  const b = Math.round(green.b + (red.b - green.b) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

const PriceRangeSlide = () => {
  const { formData, updateFormData } = useServiceContext();

  // Prix de référence
  const basePrice = formData.price;

  // Bornes à ±25%
  const defaultLower = Math.round(basePrice * 0.75);
  const defaultUpper = Math.round(basePrice * 1.25);
  const idealRange = defaultUpper - defaultLower;

  // Initialisation forcée sur les bornes calculées
  const [lowerPrice] = useState<number>(defaultLower);
  const [upperPrice, setUpperPrice] = useState<number>(defaultUpper);

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  // Position sur l’échelle 0–100
  const getPosition = (price: number) =>
    clamp(((price - defaultLower) / idealRange) * 100, 0, 100);
  const posLower = getPosition(lowerPrice);
  const posUpper = getPosition(upperPrice);

  // Calcul des déviations
  const lowerDeviation = 0; // jamais en dessous de defaultLower
  const upperDeviation =
    upperPrice > defaultUpper
      ? (upperPrice - defaultUpper) / defaultUpper
      : 0;

  const idealColor = "#84cc16";
  const leftColor = idealColor;
  const rightColor =
    upperDeviation > 0 ? interpolateColor(upperDeviation) : idealColor;

  const getGradient = () => `
    linear-gradient(
      to right,
      ${leftColor} 0%,
      ${leftColor} ${posLower}%,
      ${idealColor} ${posLower}%,
      ${idealColor} ${posUpper}%,
      ${rightColor} ${posUpper}%,
      ${rightColor} 100%
    )
  `;

  // Validation & mise à jour du contexte
  useEffect(() => {
    const errors: string[] = [];
    if (upperPrice < lowerPrice) {
      errors.push("Le prix maximum doit être ≥ prix minimum.");
    }
    setErrorMessages(errors);
    setIsValid(errors.length === 0);

    if (errors.length === 0) {
      updateFormData({ lowerPrice, upperPrice });
    }
  }, [lowerPrice, upperPrice, updateFormData]);

  // Quand l’utilisateur modifie le max
  const handleUpperChange = (value: string) => {
    if (value.trim() === "") {
      // jamais vide
      setUpperPrice(defaultUpper);
      return;
    }
    const num = Number(value);
    if (isNaN(num)) return;
    setUpperPrice(Math.round(num));
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          Définissez votre fourchette de prix
        </h2>
        <p className="text-gray-600">
          Prix de référence :{" "}
          <strong className="text-black">{basePrice}€</strong>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
        {/* Prix min fixe */}
        <div className="group relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix minimum
          </label>
          <div className="relative rounded-lg border border-gray-300 bg-gray-100">
            <input
              type="number"
              value={lowerPrice}
              disabled
              className={`w-full px-4 py-3 bg-transparent outline-none rounded-lg ${inputStyle} cursor-not-allowed`}
              style={{ MozAppearance: "textfield" }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              €
            </span>
          </div>
        </div>

        {/* Prix max éditable */}
        <div className="group relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix maximum
          </label>
          <div className="relative rounded-lg border border-gray-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
            <input
              type="number"
              value={upperPrice}
              onChange={(e) => handleUpperChange(e.target.value)}
              className={`w-full px-4 py-3 bg-transparent outline-none rounded-lg ${inputStyle}`}
              style={{ MozAppearance: "textfield" }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              €
            </span>
          </div>
        </div>
      </div>

      {/* Jauge dynamique */}
      <div className="w-full max-w-3xl space-y-4">
        <div
          className={`relative h-3 rounded-full overflow-hidden transition-all duration-300 ${
            !isValid ? "animate-pulse" : ""
          }`}
        >
          <div
            className="absolute inset-0 bg-gray-200"
            style={{ background: getGradient() }}
          />
          <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-black/20" />
        </div>
        <div className="flex justify-between text-sm font-medium">
          <span className={!isValid ? "text-red-500" : "text-gray-600"}>
            {lowerPrice}€
          </span>
          <span className="text-gray-500">Référence</span>
          <span className={!isValid ? "text-red-500" : "text-gray-600"}>
            {upperPrice}€
          </span>
        </div>
      </div>

      {/* Erreurs */}
      {errorMessages.length > 0 && (
        <div className="flex flex-col items-start space-y-2 text-red-500">
          {errorMessages.map((msg, i) => (
            <div key={i} className="flex items-center space-x-1">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriceRangeSlide;
